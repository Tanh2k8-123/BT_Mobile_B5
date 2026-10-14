import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import { Colors } from '../theme/colors';

// Import expo-video conditionally for native platforms
let useVideoPlayer: any;
let VideoView: any;
if (Platform.OS !== 'web') {
  try {
    const expoVideo = require('expo-video');
    useVideoPlayer = expoVideo.useVideoPlayer;
    VideoView = expoVideo.VideoView;
  } catch (err) {
    console.warn('expo-video could not be loaded natively:', err);
  }
}

interface VideoPlayerModalProps {
  visible: boolean;
  videoUrl: string;
  courseTitle: string;
  onClose: () => void;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  }
  return null;
}

const NativeVideoPlayer: React.FC<{ url: string }> = ({ url }) => {
  if (!useVideoPlayer || !VideoView) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>Đang tải trình phát video…</Text>
      </View>
    );
  }

  const player = useVideoPlayer(url, (p: any) => {
    p.loop = false;
    p.play();
  });

  return (
    <View style={styles.videoWrapper}>
      <VideoView
        style={styles.nativeVideo}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  );
};

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  visible,
  videoUrl,
  courseTitle,
  onClose,
}) => {
  const [loadError, setLoadError] = useState(false);
  const isYouTube = !!getYouTubeEmbedUrl(videoUrl);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);

  useEffect(() => {
    if (visible) {
      setLoadError(false);
    }
  }, [visible, videoUrl]);

  const handleOpenExternal = () => {
    if (videoUrl) {
      Linking.openURL(videoUrl).catch(() => {});
    }
  };

  const renderPlayer = () => {
    if (Platform.OS === 'web') {
      if (isYouTube && youtubeEmbedUrl) {
        return (
          // @ts-ignore Web iframe
          <iframe
            src={youtubeEmbedUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: 8,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
      return (
        // @ts-ignore Web video
        <video
          src={videoUrl}
          controls
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            borderRadius: 8,
            outline: 'none',
          }}
          onError={() => setLoadError(true)}
        >
          Trình duyệt của bạn không hỗ trợ thẻ video HTML5.
        </video>
      );
    }

    // Native Platform (Android / iOS)
    if (isYouTube) {
      return (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackIcon}>🎬</Text>
          <Text style={styles.fallbackText}>Video YouTube: Nhấn để xem trực tiếp</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.openExternalBtn} onPress={handleOpenExternal}>
            <Text style={styles.openExternalText}>Mở trong YouTube</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <NativeVideoPlayer url={videoUrl} />;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>TRAILER</Text>
              </View>
              <Text accessibilityRole="header" style={styles.title} numberOfLines={1}>
                {courseTitle}
              </Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Đóng trình phát video"
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Video Container */}
          <View style={styles.playerContainer}>
            {loadError ? (
              <View style={styles.fallbackContainer}>
                <Text style={styles.fallbackIcon}>⚠️</Text>
                <Text style={styles.fallbackText}>Không thể phát video từ đường dẫn này.</Text>
                <TouchableOpacity accessibilityRole="button" style={styles.openExternalBtn} onPress={handleOpenExternal}>
                  <Text style={styles.openExternalText}>Mở trong trình duyệt</Text>
                </TouchableOpacity>
              </View>
            ) : (
              renderPlayer()
            )}
          </View>

          {/* Footer info */}
          <View style={styles.footer}>
            <Text style={styles.urlText} numberOfLines={1}>
              {videoUrl}
            </Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Mở video trong trình duyệt ngoài" onPress={handleOpenExternal}>
              <Text style={styles.externalLink}>Mở ngoài ↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(14, 39, 31, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 700,
    backgroundColor: '#0F1E19',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#244538',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1F3C30',
  },
  headerTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 12,
  },
  headerBadge: {
    backgroundColor: Colors.coral,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  headerBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#F4F7F5',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#F4F7F5',
    fontSize: 14,
    fontWeight: 'bold',
  },
  playerContainer: {
    width: '100%',
    height: 330,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
  },
  nativeVideo: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  fallbackText: {
    color: '#A2B5AC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 14,
  },
  openExternalBtn: {
    backgroundColor: Colors.evergreen,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  openExternalText: {
    color: Colors.paper,
    fontWeight: '700',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F3C30',
  },
  urlText: {
    flex: 1,
    fontSize: 11,
    color: '#819A8E',
    marginRight: 10,
  },
  externalLink: {
    fontSize: 12,
    color: Colors.coral,
    fontWeight: '700',
  },
});
