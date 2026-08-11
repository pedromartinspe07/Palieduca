declare global {
  interface Window {
    Quill: any;
  }
}

declare module '@mgreminger/quill-image-resize-module' {
  const ImageResize: any;
  export default ImageResize;
}
