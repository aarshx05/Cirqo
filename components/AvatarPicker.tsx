'use client';

import { motion } from 'framer-motion';

const AVATARS = ['🎉', '🦊', '🐼', '🦁', '🐸', '🦄', '🐯', '🐨', '🦝', '🐮',
  '🤖', '👾', '🧙', '🧜', '🧝', '🍕', '🌵', '🎭', '🦋', '💀', '🌈', '🔥', '⚡', '🎸'];

interface AvatarPickerProps {
  value: string;
  onChange: (avatar: string) => void;
}

export default function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
      {AVATARS.map((emoji) => (
        <motion.button
          key={emoji}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(emoji)}
          className={`text-2xl w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer
            ${value === emoji
              ? 'bg-neon-pink/20 border-2 border-neon-pink shadow-[0_0_12px_rgba(255,45,120,0.5)]'
              : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
}
