export type ElementType = 'text' | 'image' | 'shape' | 'html';

export interface BaseElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number | string;
    height: number | string;
    zIndex: number;
    rotation: number;
}

export interface TextElement extends BaseElement {
    type: 'text';
    content: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textDecoration: 'none' | 'underline';
}

export interface ImageElement extends BaseElement {
    type: 'image';
    src: string;
    borderRadius: number;
}

export interface ShapeElement extends BaseElement {
    type: 'shape';
    shapeType: 'rectangle' | 'circle' | 'triangle' | 'line' | 'star';
    backgroundColor: string;
    borderRadius: number;
}

export interface HtmlElement extends BaseElement {
    type: 'html';
    content: string; // The raw HTML of the block
}

export type CanvasElement = TextElement | ImageElement | ShapeElement | HtmlElement;
