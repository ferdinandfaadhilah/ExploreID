
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

type ImageCropperProps = {
  image: string;
  onCancel: () => void;
  onSave: (croppedImage: string) => void;
};

type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

async function createCroppedImage(
  imageSrc: string,
  cropArea: Area
): Promise<string> {
  const image = new Image();
  image.src = imageSrc;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Gagal memuat gambar"));
  });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas tidak tersedia");
  }

  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  context.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );

  return canvas.toDataURL("image/jpeg", 0.92);
}

export default function ImageCropper({
  image,
  onCancel,
  onSave,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Area | null>(null);

  const onCropComplete = useCallback(
    (_: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImage = await createCroppedImage(
        image,
        croppedAreaPixels
      );

      onSave(croppedImage);
    } catch (error) {
      console.error("Gagal crop gambar:", error);
      alert("Gagal memproses gambar. Coba gambar lain.");
    }
  };

  return (
    <div className="crop-modal">
      <div className="crop-container">
        <h2>Atur Foto Profil</h2>

        <div className="crop-area">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="crop-zoom">
          <label>Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(event) =>
              setZoom(Number(event.target.value))
            }
          />
        </div>

        <div className="crop-actions">
          <button onClick={() => setZoom(1)}>
            Reset
          </button>

          <button onClick={onCancel}>
            Batal
          </button>

          <button onClick={handleSave}>
            Simpan Foto
          </button>
        </div>
      </div>
    </div>
  );
}
