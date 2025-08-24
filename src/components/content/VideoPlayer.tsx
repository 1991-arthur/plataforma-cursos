// src/components/content/VideoPlayer.tsx
'use client';

import React, { useState } from 'react';
import type { VideoContent } from '@/types/content.types';

interface VideoPlayerProps {
  content: VideoContent['data'];
}

export function VideoPlayer({ content }: VideoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Função para determinar o tipo de vídeo e gerar o embed correto
  const getVideoEmbedUrl = () => {
    const { url, provider } = content;
    
    if (provider === 'youtube') {
      // Extrair ID do YouTube
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    
    if (provider === 'vimeo') {
      // Extrair ID do Vimeo
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    
    return url;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      marginBottom: '24px'
    }}>
      {/* Player de Vídeo */}
      <div style={{
        position: 'relative',
        paddingBottom: '56.25%', // 16:9 aspect ratio
        height: 0,
        backgroundColor: '#000'
      }}>
        <iframe
          src={getVideoEmbedUrl()}
          title={content.url}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none'
          }}
        />
      </div>
      
      {/* Controles e Informações */}
      <div style={{
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f9fafb',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {content.duration && (
            <span style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              ⏱️ {formatDuration(content.duration)}
            </span>
          )}
          <span style={{
            fontSize: '12px',
            color: '#9ca3af',
            backgroundColor: '#e5e7eb',
            padding: '2px 8px',
            borderRadius: '12px',
            textTransform: 'uppercase'
          }}>
            {content.provider}
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <select
            value={playbackRate}
            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
            style={{
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              background: 'white'
            }}
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              fontSize: '16px'
            }}
          >
            {isFullscreen ? '缩小' : '⤢'}
          </button>
        </div>
      </div>
    </div>
  );
}