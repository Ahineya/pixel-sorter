import {FC, useLayoutEffect, useRef} from 'react';
import './image-viewer.scss';
import * as twgl from 'twgl.js';

const vertexShaderSource = `
attribute vec4 a_position;
attribute vec2 a_texCoord;

uniform mat3 u_matrix;

varying vec2 v_texCoord;

void main() {
  gl_Position = vec4((u_matrix * vec3(a_position.xy, 1)).xy, 0, 1);
  v_texCoord = a_texCoord;
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform sampler2D u_texture;
uniform float u_scale;
uniform float u_imageWidth;
uniform float u_imageHeight;

varying vec2 v_texCoord;

void main() {
  vec4 pixelColor = texture2D(u_texture, v_texCoord);

  if (u_scale > 50.0) {
    vec2 texSize = vec2(u_imageWidth, u_imageHeight);
    vec2 coord = v_texCoord * texSize;
    vec2 gridPosition = fract(coord);

    // Calculate line thickness in texture space based on scale and image size
    float lineThickness = 1.0;

    // Calculate threshold in texture space based on scale and image size
    float threshold = 1.0 / u_scale * texSize.x / u_imageWidth * 1.1;

    // Check if pixel is on line in x or y direction using threshold
    bool isOnLineX = gridPosition.x < threshold || gridPosition.x > 1.0 - threshold;
    bool isOnLineY = gridPosition.y < threshold || gridPosition.y > 1.0 - threshold;

    if (!isOnLineX && !isOnLineY) {
      gl_FragColor = pixelColor;
    } else {
      gl_FragColor = vec4(0.8, 0.8, 0.8, 0.1) * pixelColor;
    }
  } else {
    gl_FragColor = pixelColor;
  }
}
`;




function createTexture(gl: WebGLRenderingContext, image: HTMLImageElement): WebGLTexture {
  const texture = twgl.createTexture(gl, {
    src: image,
    min: gl.NEAREST,
    mag: gl.NEAREST
  });
  return texture;
}

type IProps = {
  image: HTMLImageElement | null;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
};

export const ImageViewer: FC<IProps> = ({image, scale = 1, offsetX = 0, offsetY = 0}) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const programInfo = useRef<twgl.ProgramInfo>();
  const bufferInfo = useRef<twgl.BufferInfo>();
  const texture = useRef<WebGLTexture>();

  useLayoutEffect(() => {
    if (!image) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl");

    if (!gl) {
      return;
    }

    programInfo.current = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource]);

    bufferInfo.current = twgl.createBufferInfoFromArrays(gl, {
      a_position: {
        numComponents: 2,
        data: [
          -1, -1,
          1, -1,
          -1, 1,
          1, 1
        ],
      },
      a_texCoord: {
        numComponents: 2,
        data: [0, 1, 1, 1, 0, 0, 1, 0],
      },
      indices: [0, 1, 2, 2, 1, 3],
    });

    if (image) {
      texture.current = createTexture(gl, image);
    }

    return () => {
      if (programInfo.current) {
        gl.deleteProgram(programInfo.current.program);
      }

      if (bufferInfo.current) {
        if (bufferInfo.current.attribs) {
          gl.deleteBuffer(bufferInfo.current.attribs.a_position.buffer);
          gl.deleteBuffer(bufferInfo.current.attribs.a_texCoord.buffer);
        }

        if (bufferInfo.current.indices) {
          gl.deleteBuffer(bufferInfo.current.indices);
        }
      }

      programInfo.current = undefined;
      bufferInfo.current = undefined;

      if (texture.current) {
        gl.deleteTexture(texture.current);
        texture.current = undefined;
      }
    }
  }, [image]);

  useLayoutEffect(() => {
    if (!image) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl");

    if (!gl) {
      return;
    }

    if (!programInfo.current) {
      return;
    }

    if (!bufferInfo.current) {
      return;
    }

    if (!texture.current) {
      return;
    }

    const tex = texture.current;

    gl.useProgram(programInfo.current.program);

    let animationFrameId: number;

    function render() {
      if (!gl || !programInfo.current || !bufferInfo.current || !tex || !image || !canvas) {
        return;
      }

      twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      twgl.setBuffersAndAttributes(gl, programInfo.current, bufferInfo.current);

      const imageAspect = image.width / image.height;
      const canvasAspect = canvas.width / canvas.height;

      const scaleX = scale * (canvasAspect > imageAspect ? imageAspect / canvasAspect : 1);
      const scaleY = scale * (canvasAspect > imageAspect ? 1 : canvasAspect / imageAspect);

      const matrix = new Float32Array([
        scaleX, 0, 0,
        0, scaleY, 0,
        offsetX, offsetY, 1,
      ]);

      twgl.setUniforms(programInfo.current, {
        u_matrix: matrix,
        u_texture: tex,
        u_scale: scale,
        u_imageWidth: image.width,
        u_imageHeight: image.height,
      });

      twgl.drawBufferInfo(gl, bufferInfo.current);

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    }
  }, [image, scale, offsetX, offsetY]);

  return (
    <div className="image-viewer">
      <canvas ref={canvasRef}/>
    </div>
  );
}
