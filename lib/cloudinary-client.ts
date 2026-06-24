import crypto from "crypto";

export const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY || "";
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET || "";

export function hasCloudinaryConfig() {
  return Boolean(cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret);
}

function signCloudinaryParams(params: Record<string, string>) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${sorted}${cloudinaryApiSecret}`).digest("hex");
}

export async function uploadToCloudinary(
  file: File
): Promise<{ url: string; publicId: string } | null> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = signCloudinaryParams({ timestamp });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", cloudinaryApiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/auto/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = (await response.json()) as { secure_url: string; public_id: string };
    return { url: data.secure_url, publicId: data.public_id };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return null;
  }
}

export async function uploadRemoteAssetToCloudinary(
  remoteUrl: string,
  folder = "saysee"
): Promise<{ url: string; publicId: string } | null> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = signCloudinaryParams({ folder, timestamp });

  const formData = new FormData();
  formData.append("file", remoteUrl);
  formData.append("folder", folder);
  formData.append("api_key", cloudinaryApiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      console.error("Cloudinary remote upload failed:", await response.text());
      return null;
    }

    const data = (await response.json()) as { secure_url: string; public_id: string };
    return { url: data.secure_url, publicId: data.public_id };
  } catch (error) {
    console.error("Cloudinary remote upload failed:", error);
    return null;
  }
}

export function buildCloudinaryDeliveryUrl(publicId: string, format: "png" | "gif") {
  return `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/f_${format}/${publicId}.${format}`;
}
