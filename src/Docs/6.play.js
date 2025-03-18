import render from "./5.render.js"

import renderTitle from './render/title.js'
import renderLoki from './render/loki.js'

export default {
    Title: (string, duration) => {
        return new Promise(async (resolve) => {
            const frames = renderTitle(string)
            const interval = render.interval.SingleTime(frames.length, duration)
            resolve(await render.animation.Repeat(frames, interval))
        })
    },
    Loki: () => {

    }
}
