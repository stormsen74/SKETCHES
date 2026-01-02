# Diese Version prüft auf fehlende Module inkl. timm, ssl, torch, cv2 etc. und gibt Hinweise im Gradio-Interface.

import numpy as np
from PIL import Image

try:
    import ssl
    import torch
    import timm
    import cv2
    import gradio as gr
    from torchvision.transforms import Compose, Resize, ToTensor, Normalize

    # MiDaS Model laden (DPT Large)
    model_type = "DPT_Large"  # Alternativ: "DPT_Hybrid", "MiDaS_small"
    midas = torch.hub.load("intel-isl/MiDaS", model_type)
    midas.eval()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    midas.to(device)

    # Transformations laden
    midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms")
    transform_func = midas_transforms.dpt_transform if "DPT" in model_type else midas_transforms.small_transform

    def estimate_depth(input_image):
        img = Image.fromarray(input_image.astype('uint8'), 'RGB')

        # transform_func erwartet ein numpy-Array, nicht ein PIL.Image
        img_np = np.asarray(img).astype(np.float32) / 255.0
        img_tensor = torch.from_numpy(img_np).permute(2, 0, 1).unsqueeze(0)

        transformed = {"image": img_tensor.to(device)}
        img_input = transformed["image"]

        with torch.no_grad():
            prediction = midas(img_input)
            prediction = torch.nn.functional.interpolate(
                prediction.unsqueeze(1),
                size=img.size[::-1],
                mode="bicubic",
                align_corners=False
            ).squeeze()

        output = prediction.cpu().numpy()
        depth_min = output.min()
        depth_max = output.max()
        output_norm = (output - depth_min) / (depth_max - depth_min)
        depth_image = (output_norm * 255).astype(np.uint8)

        return depth_image

    demo = gr.Interface(
        fn=estimate_depth,
        inputs=gr.Image(type="numpy"),
        outputs=gr.Image(type="numpy", label="Tiefenkarte"),
        title="Tiefenschätzung mit MiDaS",
        description="Lade ein Bild hoch, um eine Tiefenkarte mithilfe des MiDaS-Modells zu erzeugen."
    )

except ModuleNotFoundError as e:
    def estimate_depth(input_image):
        return np.full((input_image.shape[0], input_image.shape[1]), 127, dtype=np.uint8)

    try:
        import gradio as gr
        missing_module = str(e).split("'")[1]
        description = f"Fehler: Das erforderliche Modul '{missing_module}' ist nicht installiert oder verfügbar. Bitte installiere es mit 'pip install {missing_module}'."
    except Exception:
        description = "Fehler: Ein erforderliches Modul ist nicht installiert. Bitte installiere alle Abhängigkeiten."

    demo = gr.Interface(
        fn=estimate_depth,
        inputs=gr.Image(type="numpy"),
        outputs=gr.Image(type="numpy", label="Tiefenkarte"),
        title="Tiefenschätzung mit MiDaS",
        description=description
    )

if __name__ == "__main__":
    demo.launch()
