import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { FlexatarRendererView } from './modules/flexatar-renderer';
import AudioPipeline, { AudioCompatibilityResult, AudioPipelineStats } from './modules/audio-pipeline';

const stages = [
  ['Phase 1', 'Flexatar Android renderer'],
  ['Phase 2', 'Real-time voice-processing pipeline'],
  ['Phase 3', 'Processed audio → Flexatar lip-sync'],
  ['Phase 4', 'Frames → controlled virtual-camera test sink'],
  ['Phase 5', 'Camera2 integration test harness'],
  ['Phase 6', 'Android microphone processing test sink'],
  ['Phase 7', 'Audio compatibility test harness'],
  ['Phase 8', 'Unified APK/control interface'],
] as const;

export default function App() {
  const [camera, requestCamera] = useCameraPermissions();
  const [microphone, requestMicrophone] = useMicrophonePermissions();
  const [tab, setTab] = useState<'control' | 'camera' | 'renderer'>('control');
  const [voiceRunning, setVoiceRunning] = useState(false);
  const [audioRms, setAudioRms] = useState(0);
  const [compatibility, setCompatibility] = useState<AudioCompatibilityResult | null>(null);
  const [audioStats, setAudioStats] = useState<AudioPipelineStats>({ pcmChunks: 0, rejectedChunks: 0, lastSequence: -1, acceptedFrames: 0 });
  const rendererRef = useRef<any>(null);

  useEffect(() => {
    const pcmSubscription = AudioPipeline.addListener('audioPcm', async (event) => {
      const result = await AudioPipeline.validatePcmChunk(
        event.base64,
        event.sampleRate,
        1,
        event.frames,
        event.format,
        event.sequence
      );
      setCompatibility(result);
      setAudioStats(AudioPipeline.getStats());

      if (result.accepted) {
        rendererRef.current?.feedAudioPcm(event.base64);
      }
    });
    const levelSubscription = AudioPipeline.addListener('audioLevel', (event) => {
      setAudioRms(event.rms);
    });

    return () => {
      pcmSubscription.remove();
      levelSubscription.remove();
      AudioPipeline.stop().catch(() => undefined);
    };
  }, []);

  const refreshAudioStats = () => setAudioStats(AudioPipeline.getStats());

  const resetAudioDiagnostics = () => {
    AudioPipeline.resetStats();
    setCompatibility(null);
    setAudioStats(AudioPipeline.getStats());
  };

  const toggleUnifiedPipeline = async () => {
    if (voiceRunning) {
      await AudioPipeline.stop();
      setVoiceRunning(false);
      refreshAudioStats();
      return;
    }

    const permission = await requestMicrophone();
    if (!permission.granted) return;

    AudioPipeline.resetStats();
    setCompatibility(null);
    await AudioPipeline.start();
    setVoiceRunning(true);
    setTab('renderer');
  };

  return <SafeAreaView style={styles.root}>
    <StatusBar style="light" />
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Flexatar Android</Text>
      <Text style={styles.subtitle}>Expo control layer • native renderer + voice pipeline</Text>

      <View style={styles.tabs}>
        {(['control', 'renderer', 'camera'] as const).map((item) => <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.tabActive]}><Text style={styles.tabText}>{item}</Text></Pressable>)}
      </View>

      {tab === 'control' && <>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Unified pipeline</Text>
          <Text style={styles.label}>One app-controlled path: microphone → processed 16 kHz mono PCM → compatibility gate → Flexatar lip-sync renderer.</Text>
          <Pressable style={[styles.button, voiceRunning && styles.buttonStop]} onPress={toggleUnifiedPipeline}>
            <Text style={styles.buttonText}>{voiceRunning ? 'Stop unified pipeline' : 'Start unified pipeline'}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pipeline status</Text>
          {stages.map(([id, label], i) => {
            const state = i === 0 ? 'COMPLETE' : i === 1 || i === 2 ? 'ACTIVE' : i === 6 && compatibility ? (compatibility.accepted ? 'ACTIVE' : 'CHECK') : i === 7 && voiceRunning ? 'ACTIVE' : 'PLANNED';
            return <View key={id} style={styles.row}>
              <View style={[styles.dot, state === 'COMPLETE' ? styles.dotActive : state === 'ACTIVE' ? styles.dotWorking : styles.dotPending]} />
              <View style={styles.rowText}><Text style={styles.phase}>{id}</Text><Text style={styles.label}>{label}</Text></View>
              <Text style={styles.state}>{state}</Text>
            </View>;
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Audio compatibility</Text>
          <Text style={styles.label}>Chunks accepted: {audioStats.pcmChunks}</Text>
          <Text style={styles.label}>Chunks rejected: {audioStats.rejectedChunks}</Text>
          <Text style={styles.label}>Accepted frames: {audioStats.acceptedFrames}</Text>
          <Text style={styles.label}>Last sequence: {audioStats.lastSequence}</Text>
          <Text style={styles.label}>Last validation: {compatibility ? `${compatibility.accepted ? 'PASS' : 'FAIL'} • ${compatibility.reason}` : 'waiting for PCM'}</Text>
          <Pressable style={styles.secondaryButton} onPress={resetAudioDiagnostics}><Text style={styles.buttonText}>Reset diagnostics</Text></Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Permissions</Text>
          <Text style={styles.label}>Camera: {camera?.status ?? 'checking'}</Text>
          <Text style={styles.label}>Microphone: {microphone?.status ?? 'checking'}</Text>
          <Pressable style={styles.button} onPress={async () => { await requestCamera(); await requestMicrophone(); }}><Text style={styles.buttonText}>Request media permissions</Text></Pressable>
        </View>
        <View style={styles.notice}><Text style={styles.noticeTitle}>Integration boundary</Text><Text style={styles.label}>The renderer, processed audio, and frame pipeline are app-controlled. Third-party camera or microphone injection is not enabled by this build.</Text></View>
      </>}

      {tab === 'renderer' && <>
        <View style={styles.preview}><FlexatarRendererView ref={rendererRef} style={StyleSheet.absoluteFill} /></View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live voice → lip-sync</Text>
          <Text style={styles.label}>16 kHz mono PCM • noise gate • gain • soft limiter • compatibility validation • Flexatar speech inference</Text>
          <Text style={styles.label}>Input level: {audioRms.toFixed(3)}</Text>
          <Text style={styles.label}>Compatibility: {compatibility?.accepted ? 'PASS' : compatibility ? `FAIL (${compatibility.reason})` : 'waiting'}</Text>
          <Pressable style={[styles.button, voiceRunning && styles.buttonStop]} onPress={toggleUnifiedPipeline}>
            <Text style={styles.buttonText}>{voiceRunning ? 'Stop voice processing' : 'Start voice processing'}</Text>
          </Pressable>
        </View>
      </>}

      {tab === 'camera' && <View style={styles.preview}><CameraView style={StyleSheet.absoluteFill} facing="front" mode="picture" /></View>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080a0f' },
  content: { padding: 20, gap: 16 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#8e98a8', marginTop: -10 },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: '#151922' },
  tabActive: { backgroundColor: '#273047' },
  tabText: { color: '#fff', textTransform: 'capitalize' },
  card: { backgroundColor: '#11151d', borderRadius: 16, padding: 16, gap: 12 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  dotActive: { backgroundColor: '#4ade80' },
  dotWorking: { backgroundColor: '#facc15' },
  dotPending: { backgroundColor: '#586174' },
  rowText: { flex: 1 },
  phase: { color: '#dbe2ef', fontWeight: '700', fontSize: 12 },
  label: { color: '#8e98a8', lineHeight: 20 },
  state: { color: '#687386', fontSize: 10, fontWeight: '700' },
  button: { marginTop: 6, backgroundColor: '#2f6fed', borderRadius: 10, padding: 12, alignItems: 'center' },
  secondaryButton: { marginTop: 6, backgroundColor: '#273047', borderRadius: 10, padding: 12, alignItems: 'center' },
  buttonStop: { backgroundColor: '#9b3b3b' },
  buttonText: { color: '#fff', fontWeight: '700' },
  notice: { borderWidth: 1, borderColor: '#2b3342', borderRadius: 14, padding: 14, gap: 5 },
  noticeTitle: { color: '#dbe2ef', fontWeight: '700' },
  preview: { height: 520, borderRadius: 18, overflow: 'hidden', backgroundColor: '#0b0d12' },
});
