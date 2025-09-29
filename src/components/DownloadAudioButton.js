import { toast } from 'react-toastify';

export default function DownloadAudioButton({ recipe, user }) {
  const isPremium = user?.isPremium;

  if (!recipe.audio?.mp3_url) {
    return (
      <button
        className="flex-1 flex items-center justify-center gap-2 bg-gray-400 text-white px-2 py-2 rounded-lg font-semibold text-sm transition"
        disabled
        style={{ textAlign: 'center' }}
      >
        <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
          <path
            d="M18.6,5.2C18.3,5,18,5,17.7,5L5.8,9H2c-0.5,0-1,0.5-1,1v6v6c0,0.5,0.5,1,1,1h3.8l11.8,4c0.1,0,0.2,0,0.3,0
    c0.2,0,0.4-0.1,0.6-0.2c0.3-0.2,0.4-0.5,0.4-0.8V16V6C19,5.7,18.8,5.4,18.6,5.2z"
            fill="#FFC10A"
          />
          <path
            d="M25.8,16c0.1-2.9-0.8-5.6-2.8-7.8c-0.4-0.4-1-0.5-1.4-0.1c-0.4,0.4-0.5,1-0.1,1.4c1.6,1.8,2.4,4.1,2.2,6.5
    c0,0,0,0.1,0,0.1c-0.2,2.4-1.3,4.7-3.1,6.3c-0.4,0.4-0.5,1-0.1,1.4c0.2,0.2,0.5,0.3,0.8,0.3c0.2,0,0.5-0.1,0.7-0.3
    c2.2-2,3.6-4.7,3.8-7.6C25.8,16.2,25.8,16.1,25.8,16z"
            fill="#673AB7"
          />
          <path
            d="M27.3,5.5c-0.4-0.4-1-0.5-1.4-0.1c-0.4,0.4-0.5,1-0.1,1.4c2.3,2.6,3.4,6,3.2,9.2c-0.2,3.4-1.7,6.7-4.4,9.1
    c-0.4,0.4-0.5,1-0.1,1.4c0.2,0.2,0.5,0.3,0.8,0.3c0.2,0,0.5-0.1,0.7-0.3C29.1,23.8,30.8,20,31,16C31.1,12.3,29.9,8.5,27.3,5.5z"
            fill="#673AB7"
          />
          <path
            d="M5,10c0-0.4,0.3-0.8,0.7-1l0.2,0H2c-0.5,0-1,0.5-1,1v6v6c0,0.5,0.5,1,1,1h3.8l-0.2,0C5.3,22.8,5,22.4,5,22
    v-6V10z"
            fill="#673AB7"
          />
        </svg>
        Download Audio
      </button>
    );
  }

  const handleDownloadAudio = async () => {
    if (!user) {
      toast.info(
        'Audio downloads are a premium feature. Please log in and upgrade to premium to access this.'
      );
      return;
    }
    if (!isPremium) {
      toast.info('Upgrade to premium to download audio files.');
      return;
    }
    try {
      const response = await fetch(recipe.audio.mp3_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FlavorHUB254-${recipe.title.replace(/\s+/g, '_')}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Failed to download audio.');
    }
  };

  return (
    <button
      className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded-lg font-semibold text-sm transition"
      style={{ textAlign: 'center' }}
      onClick={handleDownloadAudio}
    >
      <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
        <path
          d="M18.6,5.2C18.3,5,18,5,17.7,5L5.8,9H2c-0.5,0-1,0.5-1,1v6v6c0,0.5,0.5,1,1,1h3.8l11.8,4c0.1,0,0.2,0,0.3,0
    c0.2,0,0.4-0.1,0.6-0.2c0.3-0.2,0.4-0.5,0.4-0.8V16V6C19,5.7,18.8,5.4,18.6,5.2z"
          fill="#FFC10A"
        />
        <path
          d="M25.8,16c0.1-2.9-0.8-5.6-2.8-7.8c-0.4-0.4-1-0.5-1.4-0.1c-0.4,0.4-0.5,1-0.1,1.4c1.6,1.8,2.4,4.1,2.2,6.5
    c0,0,0,0.1,0,0.1c-0.2,2.4-1.3,4.7-3.1,6.3c-0.4,0.4-0.5,1-0.1,1.4c0.2,0.2,0.5,0.3,0.8,0.3c0.2,0,0.5-0.1,0.7-0.3
    c2.2-2,3.6-4.7,3.8-7.6C25.8,16.2,25.8,16.1,25.8,16z"
          fill="#673AB7"
        />
        <path
          d="M27.3,5.5c-0.4-0.4-1-0.5-1.4-0.1c-0.4,0.4-0.5,1-0.1,1.4c2.3,2.6,3.4,6,3.2,9.2c-0.2,3.4-1.7,6.7-4.4,9.1
    c-0.4,0.4-0.5,1-0.1,1.4c0.2,0.2,0.5,0.3,0.8,0.3c0.2,0,0.5-0.1,0.7-0.3C29.1,23.8,30.8,20,31,16C31.1,12.3,29.9,8.5,27.3,5.5z"
          fill="#673AB7"
        />
        <path
          d="M5,10c0-0.4,0.3-0.8,0.7-1l0.2,0H2c-0.5,0-1,0.5-1,1v6v6c0,0.5,0.5,1,1,1h3.8l-0.2,0C5.3,22.8,5,22.4,5,22
    v-6V10z"
          fill="#673AB7"
        />
      </svg>
      Download Audio
    </button>
  );
}
