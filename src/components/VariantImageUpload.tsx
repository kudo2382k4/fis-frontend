import { useState } from 'react';
import { Upload, Image, Spin, message } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { uploadApi } from '../api/uploadApi';

interface Props {
  value?: string;
  onChange?: (url: string | undefined) => void;
}

/**
 * Component upload ảnh cho từng biến thể sản phẩm.
 * Tích hợp với antd Form.Item thông qua value/onChange.
 */
export function VariantImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const file = options.file as File;
    setUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      onChange?.(url);
      message.success('Upload ảnh thành công!');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Upload thất bại';
      message.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange?.(undefined);
  };

  // Nếu đã có ảnh → hiển thị preview + nút xóa
  if (value) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Image
          src={value}
          alt="Ảnh biến thể"
          width={72}
          height={72}
          style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)' }}
          preview={{ mask: 'Xem' }}
        />
        <div
          onClick={handleRemove}
          style={{
            position: 'absolute', top: -6, right: -6,
            width: 18, height: 18, borderRadius: '50%',
            background: '#ff4d4f', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, cursor: 'pointer', fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          }}
          title="Xóa ảnh"
        >
          ✕
        </div>
      </div>
    );
  }

  // Chưa có ảnh → hiển thị vùng upload
  return (
    <Upload
      accept="image/jpeg,image/png,image/gif,image/webp"
      showUploadList={false}
      customRequest={handleUpload}
      beforeUpload={(file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) { message.error('Chỉ chấp nhận file ảnh!'); return false; }
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) { message.error('Ảnh phải nhỏ hơn 10MB!'); return false; }
        return true;
      }}
    >
      <div
        style={{
          width: 72, height: 72, borderRadius: 8,
          border: '1px dashed rgba(255,255,255,0.25)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', gap: 4,
          background: 'rgba(255,255,255,0.03)',
          transition: 'border-color 0.2s',
        }}
      >
        {uploading
          ? <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} />} />
          : <>
              <PlusOutlined style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)' }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Thêm ảnh</span>
            </>
        }
      </div>
    </Upload>
  );
}
