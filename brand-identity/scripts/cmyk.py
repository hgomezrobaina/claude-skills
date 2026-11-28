#!/usr/bin/env python3
"""sRGB → CMYK con un perfil ICC real (LittleCMS vía Pillow). Valores para imprenta.

Uso: python3 -I cmyk.py --icc <perfil.icc> "#1e2bfa" "#ff6b35" [--intent relative|perceptual]

Perfiles gratuitos habituales (preguntar al usuario dónde se imprime):
  · Europa: ISO Coated v2 (FOGRA39) o PSO Coated v3 (FOGRA51) — eci.org
  · América: GRACoL2013 / CRPC6 o US Web Coated (SWOP) — idealliance / Adobe ICC profiles
Sin perfil no hay CMYK fiable: la conversión ingenua de palette.mjs es solo orientativa.
Pantone no se calcula: se elige con la guía física o Pantone Connect y se anota como dato.
"""
import argparse
import io
import sys

from PIL import Image, ImageCms


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--icc", required=True)
    parser.add_argument("--intent", choices=["relative", "perceptual"], default="relative")
    parser.add_argument("colors", nargs="+")
    args = parser.parse_args()
    intent = ImageCms.Intent.RELATIVE_COLORIMETRIC if args.intent == "relative" else ImageCms.Intent.PERCEPTUAL
    srgb = ImageCms.createProfile("sRGB")
    cmyk = ImageCms.getOpenProfile(args.icc)
    transform = ImageCms.buildTransform(srgb, cmyk, "RGB", "CMYK", renderingIntent=intent, flags=ImageCms.Flags.BLACKPOINTCOMPENSATION)
    print(f"Perfil: {ImageCms.getProfileDescription(cmyk).strip()} · intento {args.intent}")
    for value in args.colors:
        h = value.lstrip("#")
        if len(h) != 6:
            print(f"{value}: no es un hex de 6 dígitos", file=sys.stderr)
            continue
        rgb = tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))
        px = ImageCms.applyTransform(Image.new("RGB", (1, 1), rgb), transform).getpixel((0, 0))
        c, m, y, k = (round(v / 255 * 100) for v in px)
        print(f"#{h.upper()} → C{c} M{m} Y{y} K{k}")


if __name__ == "__main__":
    main()
