import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Check } from "lucide-react";
import { useState } from "react";
import profileAvatar from "@/assets/profile-avatar.webp";

interface EditProfileSheetProps {
  open: boolean;
  onClose: () => void;
  profile: { name: string; location: string; bio: string };
  onSave: (profile: { name: string; location: string; bio: string }) => void;
}

export default function EditProfileSheet({ open, onClose, profile, onSave }: EditProfileSheetProps) {
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [bio, setBio] = useState(profile.bio);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), location: location.trim(), bio: bio.trim() });
    onClose();
  };

  const hasChanges = name !== profile.name || location !== profile.location || bio !== profile.bio;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-3xl max-h-[85vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <button onClick={onClose} className="text-muted-foreground">
                <X size={22} />
              </button>
              <h2 className="text-base font-bold text-foreground">Edit Profile</h2>
              <motion.button
                onClick={handleSave}
                disabled={!hasChanges || !name.trim()}
                whileTap={{ scale: 0.92 }}
                className="text-sm font-semibold text-primary disabled:opacity-40"
              >
                Save
              </motion.button>
            </div>

            <div className="px-5 pb-8 space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center pt-2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary border-2 border-primary/30">
                    <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Camera size={14} className="text-primary-foreground" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Tap to change photo</p>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={30}
                  className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                  placeholder="Your name"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={40}
                  className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                  placeholder="City, Country"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={150}
                  rows={3}
                  className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none focus:ring-1 focus:ring-primary/40 transition-all"
                  placeholder="Tell others about yourself..."
                />
                <p className="text-right text-[10px] text-muted-foreground">{bio.length}/150</p>
              </div>

              {/* Save button (mobile-friendly) */}
              <motion.button
                onClick={handleSave}
                disabled={!hasChanges || !name.trim()}
                whileTap={{ scale: 0.96 }}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-semibold disabled:opacity-40 transition-all"
              >
                <Check size={16} /> Save Changes
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
