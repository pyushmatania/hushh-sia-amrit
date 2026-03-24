import { useState } from "react";
import { X, Upload, Video, Info, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface VideoEditorProps {
  videoUrl: string | null;
  onChange: (url: string | null) => void;
  storagePath?: string;
  label?: string;
  dimensionTip?: string;
}

export default function VideoEditor({
  videoUrl,
  onChange,
  storagePath = "videos",
  label = "Video",
  dimensionTip = "Recommended: 1080×1920px (9:16 vertical), MP4, under 15MB, 5-15 seconds",
}: VideoEditorProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${storagePath}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("listing-images").upload(path, file);
    if (!error) {
      const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
      if (urlData?.publicUrl) onChange(urlData.publicUrl);
    }
    setUploading(false);
  };

  return (
    <div>
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
        {label}
      </label>
      <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1 mb-2">
        <Info size={9} className="shrink-0" /> {dimensionTip}
      </p>

      {videoUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-border aspect-[9/16] max-h-[280px] mb-2 group bg-black">
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            autoPlay
          />
          <button
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
          >
            <X size={12} />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-[10px] text-white font-medium flex items-center gap-1">
            <Play size={8} /> Video
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-border aspect-[9/16] max-h-[200px] flex flex-col items-center justify-center gap-2 text-muted-foreground mb-2">
          <Video size={24} className="text-muted-foreground/40" />
          <p className="text-xs">No video</p>
        </div>
      )}

      <div className="space-y-2">
        <label className={`w-full py-3 rounded-xl border-2 border-dashed border-primary/30 text-xs text-primary font-medium hover:bg-primary/5 transition flex items-center justify-center gap-1.5 cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          <Upload size={14} /> {uploading ? "Uploading..." : videoUrl ? "Replace Video" : "Upload Video"}
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
        </label>
        <Input
          placeholder="Or paste video URL and press Enter..."
          className="text-xs"
          onKeyDown={e => {
            if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
              onChange((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = "";
            }
          }}
        />
      </div>
    </div>
  );
}
