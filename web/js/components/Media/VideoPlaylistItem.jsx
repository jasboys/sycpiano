import React from 'react';

export default class VideoPlaylistItem extends React.Component {
    onClick() {
        this.props.onClick(this.props.video.snippet.resourceId.videoId);
    }

    render() {
        return (
            <li className="videoPlaylistItem" onClick={this.onClick.bind(this)}>
                <img src={this.props.video.snippet.thumbnails.high.url}></img>
            </li>
            );
    }
}

/*
{
  "kind": "youtube#playlistItem",
  "etag": etag,
  "id": string,
  "snippet": {
    "publishedAt": datetime,
    "channelId": string,
    "title": string,
    "description": string,
    "thumbnails": {
      (key): {
        "url": string,
        "width": unsigned integer,
        "height": unsigned integer
      }
    },
    "channelTitle": string,
    "playlistId": string,
    "position": unsigned integer,
    "resourceId": {
      "kind": string,
      "videoId": string,
    }
  },
  "contentDetails": {
    "videoId": string,
    "startAt": string,
    "endAt": string,
    "note": string
  },
  "status": {
    "privacyStatus": string
  }
}
*/