export type LayerType = 'image' | 'text';

export interface BaseLayer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export type Layer = ImageLayer | TextLayer;

export interface Draft {
  id: string;
  createdAt: number;
  baseImage: string;
  layers: Layer[];
}
