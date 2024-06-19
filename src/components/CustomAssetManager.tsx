import React, { useState } from 'react';
import { useEditor } from '@grapesjs/react'; // 确保从正确的包导入
import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import type { Asset } from 'grapesjs';
import { BTN_CLS } from './common';

export type CustomAssetManagerProps = {
  assets: Asset[];
  select: (asset: Asset, flag: boolean) => void;
  close: () => void;
};

const CustomAssetManager = ({ assets, select }: CustomAssetManagerProps) => {
  const editor = useEditor(); // 正确使用 useEditor 钩子
  const [uploading, setUploading] = useState(false);

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor.AssetManager.add({
          src: e.target.result,
          type: 'image',
          name: file.name
        });
        setUploading(false);
      };
      reader.readAsDataURL(file);
      setUploading(true);
    }
  };

  const remove = (asset: Asset) => {
    editor.AssetManager.remove(asset);
  };

  return (
    <div className="asset-manager">
      <input type="file" onChange={handleUpload} accept="image/*" style={{ margin: '10px 0' }} />
      <div className="grid grid-cols-3 gap-2 pr-2">
        {assets.map((asset) => (
          <div
            key={asset.getSrc()}
            className="relative group rounded overflow-hidden"
          >
            <img className="display-block w-full h-auto" src={asset.getSrc()} alt={asset.get('name') || 'Asset'} />
            <div className="flex flex-col items-center justify-end absolute top-0 left-0 w-full h-full p-5 bg-zinc-700/75 group-hover:opacity-100 opacity-0 transition-opacity">
              <button
                type="button"
                className={BTN_CLS}
                onClick={() => select(asset, true)}
              >
                Select
              </button>
              <button
                type="button"
                className="absolute top-2 right-2 text-white"
                onClick={() => remove(asset)}
              >
                <Icon size={1} path={mdiClose} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {uploading && <p>Loading...</p>}
    </div>
  );
};

export default CustomAssetManager;
