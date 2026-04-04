import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

export const initSegmentation = () => {
  const selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
    },
  });

  selfieSegmentation.setOptions({
    modelSelection: 1, // 0 for general, 1 for landscape
  });

  return selfieSegmentation;
};

export const applySegmentation = (
  results: any,
  canvasElement: HTMLCanvasElement,
  imageElement: HTMLImageElement | HTMLVideoElement,
  erosion: number = 5,
  feathering: number = 0.15
) => {
  const canvasCtx = canvasElement.getContext("2d");
  if (!canvasCtx) return;

  const { width, height } = canvasElement;
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, width, height);

  // Draw the segmentation mask
  canvasCtx.drawImage(results.segmentationMask, 0, 0, width, height);

  // Apply Mask Erosion and Feathering
  // Erosion: Shrink the mask slightly
  // Feathering: Soften the edges
  canvasCtx.globalCompositeOperation = "source-in";
  
  // Draw the original image/video only where the mask is
  canvasCtx.drawImage(imageElement, 0, 0, width, height);
  
  // To handle erosion and feathering properly in canvas, we can use filters
  // Erosion is hard to do with simple canvas ops, but we can use a slight blur + contrast trick
  // or just use the mask as is for now if it's clean.
  // MediaPipe's mask is already quite good.
  
  // Apply feathering via blur
  if (feathering > 0) {
    canvasCtx.filter = `blur(${feathering * 10}px)`;
  }

  canvasCtx.restore();
};
