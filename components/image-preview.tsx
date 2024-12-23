import Image from 'next/image'

interface ImagePreviewProps {
  src: string
  alt: string
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}

