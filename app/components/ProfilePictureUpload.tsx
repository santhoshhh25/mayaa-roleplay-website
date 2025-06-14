'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaUpload, FaTrash, FaUser } from 'react-icons/fa';

interface ProfilePictureUploadProps {
  currentAvatar?: string;
  userId: string;
  onUpload?: (imageUrl: string) => void;
  onRemove?: () => void;
  className?: string;
}

export default function ProfilePictureUpload({
  currentAvatar,
  userId,
  onUpload,
  onRemove,
  className = ""
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      // Upload to your API endpoint
      const response = await fetch('/api/upload-profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (onUpload) {
        onUpload(data.imageUrl);
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentAvatar) return;

    try {
      const response = await fetch('/api/remove-profile-picture', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Remove failed');
      }

      setPreviewUrl(null);
      if (onRemove) {
        onRemove();
      }
    } catch (error) {
      console.error('Remove error:', error);
      alert('Failed to remove image. Please try again.');
    }
  };

  const displayImage = previewUrl || currentAvatar;

  return (
    <div className={`relative ${className}`}>
      <div className="relative group">
        {/* Avatar Display */}
        <div className="w-24 h-24 rounded-full border-4 border-primary/20 overflow-hidden bg-primary/10 flex items-center justify-center">
          {displayImage ? (
            <img 
              src={displayImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <FaUser className="text-4xl text-primary/50" />
          )}
        </div>

        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <FaCamera className="text-white text-xl" />
        </div>

        {/* Upload Button */}
        <motion.button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary hover:bg-primary/80 text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FaUpload className="text-xs" />
          )}
        </motion.button>

        {/* Remove Button */}
        {displayImage && !isUploading && (
          <motion.button
            onClick={handleRemove}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
          >
            <FaTrash className="text-xs" />
          </motion.button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Instructions */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-400">
          Click to upload profile picture
        </p>
        <p className="text-xs text-gray-500">
          Max 5MB • JPG, PNG, GIF
        </p>
      </div>
    </div>
  );
} 