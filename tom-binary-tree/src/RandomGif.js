import React from 'react'
import { Rx } from 'tom'
import axios from 'axios'

// EVENTS

export class MoreRequested {
  update(model) {
    return {
      model: model,
      effect: new FetchRandomGif(model.topic)
    }
  }
}

class GifFetched {
  constructor(gifUrl) {
    this.gifUrl = gifUrl
  }
  update(model) {
    return {
      model: {
        topic: model.topic,
        gifUrl: this.gifUrl
      }
    }
  }
}

// EFFECTS

class FetchRandomGif {
  constructor(topic) {
    this.topic = topic
  }
  run() {
    return Rx.Observable.fromPromise(
      fetchRandomGif(this.topic)
        .then(gifUrl => new GifFetched(gifUrl))
        .catch(() => new GifFetched(WAITING_GIF))
    )
  }
}

// APP

export default class RandomGif {

  constructor(defaultTopic) {
    this.defaultTopic = defaultTopic
  }

  init() {
    return {
      model: {
        topic: this.defaultTopic,
        gifUrl: WAITING_GIF
      }
    }
  }

  update(model, event) {
    return event.update(model)
  }

  view(model, dispatch) {
    const onMoreRequested = () => dispatch(new MoreRequested())
    return (
      <div style={containerStyle}>
        <h2>{model.topic}</h2>
        <div style={getImgStyle(model.gifUrl)} />
        <p><button onClick={onMoreRequested}>More Please!</button></p>
      </div>
    )
  }

  run(effect) {
    return effect.run()
  }

}

// HELPERS

const containerStyle = {
  width: '200px',
  textAlign: 'center',
  border: '1px dashed #ccc'
}

function getImgStyle(url) {
  return {
    display: 'inline-block',
    width: '200px',
    height: '200px',
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
    backgroundImage: `url("${url}")`
  }
}

const WAITING_GIF = 'data:image/gif;base64,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'

const getUrl = tag => `http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${tag}`

const fetchRandomGif = topic => axios.get(getUrl(topic)).then(res => res.data.data.image_url)

