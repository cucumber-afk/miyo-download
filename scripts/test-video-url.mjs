import assert from 'node:assert/strict';
import { getYouTubeEmbedUrl, parseYouTubeVideoId } from '../shared/video-url.js';

const validCases = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
  'https://youtube.com/watch?v=dQw4w9WgXcQ&t=10',
  'https://youtu.be/dQw4w9WgXcQ?t=10',
];

for (const value of validCases) assert.equal(parseYouTubeVideoId(value), 'dQw4w9WgXcQ');
assert.equal(getYouTubeEmbedUrl(validCases[0]), 'https://www.youtube.com/embed/dQw4w9WgXcQ');
assert.equal(parseYouTubeVideoId('https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ'), null);
assert.equal(parseYouTubeVideoId('javascript:alert(1)'), null);
assert.equal(parseYouTubeVideoId('https://youtu.be/'), null);
assert.equal(parseYouTubeVideoId('http://www.youtube.com/watch?v=dQw4w9WgXcQ'), null);
assert.equal(parseYouTubeVideoId('https://www.youtube.com.evil.com/watch?v=dQw4w9WgXcQ'), null);

console.log('video URL parser tests passed');
