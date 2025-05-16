import render from '../../../interface/console';
import renderTitle from './0.title';
import renderLoki from './1.loki';

interface FrameAnimations {
    Title(string: string, duration: number, repeat?: number): Promise<void>;
    Loki(string: string, varients?: number, duration?: number): Promise<void>;
}

const frameAnimations: FrameAnimations = {
    Title: (string: string, duration: number, repeat: number = 1): Promise<void> => {
        return new Promise(async (resolve) => {
            const frames = renderTitle(string);
            resolve(await render.animate(frames, duration, repeat));
        });
    },
    Loki: (string: string, varients: number = 50, duration?: number): Promise<void> => {
        return new Promise(async (resolve) => {
            const frames = renderLoki(string, varients);
            resolve(await render.animate(frames, duration, 0));
        });
    }
};

export default frameAnimations;