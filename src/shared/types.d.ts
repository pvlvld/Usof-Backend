import type sharp from "sharp";

export type IImageMimeType = `image/${keyof sharp.FormatEnum}`;

export type ISharpImageOptions = {
  width: number;
  fileFormat: keyof sharp.FormatEnum;
  quality: number;
};
