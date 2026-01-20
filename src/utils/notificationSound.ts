/**
 * Notification Sound Utility
 * Plays a sound when notifications arrive
 */

// Create a simple notification sound using Web Audio API
function createNotificationSound(): AudioBuffer | null {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const duration = 0.3; // 300ms
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channel = buffer.getChannelData(0);

    // Create a pleasant notification sound (two-tone beep)
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      
      // First tone (higher pitch) for first half
      if (t < duration / 2) {
        channel[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 8) * 0.3;
      } 
      // Second tone (slightly lower pitch) for second half
      else {
        const t2 = t - duration / 2;
        channel[i] = Math.sin(2 * Math.PI * 600 * t2) * Math.exp(-t2 * 8) * 0.3;
      }
    }

    return buffer;
  } catch (error) {
    console.error('Error creating notification sound:', error);
    return null;
  }
}

// Play the notification sound
export function playNotificationSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const buffer = createNotificationSound();
    
    if (!buffer) {
      console.warn('Could not create notification sound');
      return;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    
    console.log('🔊 Notification sound played');
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

// Play a more prominent reminder sound for event reminders
export function playReminderSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const duration = 0.6; // 600ms - longer for reminders
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channel = buffer.getChannelData(0);

    // Create a three-tone ascending notification sound
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const segment = duration / 3;
      
      if (t < segment) {
        // First tone (low)
        channel[i] = Math.sin(2 * Math.PI * 600 * t) * Math.exp(-t * 6) * 0.4;
      } else if (t < segment * 2) {
        // Second tone (medium)
        const t2 = t - segment;
        channel[i] = Math.sin(2 * Math.PI * 750 * t2) * Math.exp(-t2 * 6) * 0.4;
      } else {
        // Third tone (high)
        const t3 = t - segment * 2;
        channel[i] = Math.sin(2 * Math.PI * 900 * t3) * Math.exp(-t3 * 6) * 0.4;
      }
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    
    console.log('🔔 Reminder sound played');
  } catch (error) {
    console.error('Error playing reminder sound:', error);
  }
}

// Check if sound is supported
export function isSoundSupported(): boolean {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
}
