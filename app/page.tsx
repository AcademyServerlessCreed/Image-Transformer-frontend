import { ImageUploader } from "@/components/image-uploader";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-24">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center">Image Resizer</h1>
        <p className="text-center text-muted-foreground">
          Upload an image and we&apos;ll resize it to 200x200 and 800x600 for
          you
        </p>
        <ImageUploader />
      </div>
      <Toaster />
    </main>
  );
}
