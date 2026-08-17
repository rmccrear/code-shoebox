import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MediaPanel } from './MediaPanel';
import { MediaAsset } from '../types';

describe('MediaPanel', () => {
  it('previews an image and shows bounded HTML and CSS usage snippets', () => {
    const assets: readonly MediaAsset[] = [
      {
        kind: 'image',
        name: 'Moonrise',
        src: 'https://example.test/moon.jpg',
        alt: 'The moon above a ridge',
      },
    ];

    const { container } = render(<MediaPanel mediaAssets={assets} themeMode="dark" />);

    expect(screen.getByRole('tab', { name: /Moonrise/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('img', { name: 'The moon above a ridge' })).toHaveAttribute(
      'src',
      assets[0].src
    );
    expect(screen.getByText('HTML')).toBeInTheDocument();
    expect(screen.getByText('CSS')).toBeInTheDocument();
    expect(screen.getByText(`<img src="${assets[0].src}" alt="The moon above a ridge">`)).toBeInTheDocument();
    expect(screen.getByText(`.media-image { background-image: url("${assets[0].src}"); }`)).toBeInTheDocument();
    expect(container.querySelector('textarea, [contenteditable="true"]')).toBeNull();
  });

  it('switches among image, audio, and video assets with native playback snippets', () => {
    const assets: readonly MediaAsset[] = [
      { kind: 'image', name: 'Poster', src: '/poster.jpg', alt: 'Event poster' },
      { kind: 'audio', name: 'Chime', src: '/chime.wav' },
      { kind: 'video', name: 'Orbit', src: '/orbit.mp4' },
    ];

    render(<MediaPanel mediaAssets={assets} themeMode="light" />);

    fireEvent.click(screen.getByRole('tab', { name: /Chime/ }));
    expect(screen.getByLabelText('Audio preview: Chime')).toHaveAttribute('src', '/chime.wav');
    expect(screen.getByText('<audio controls src="/chime.wav"></audio>')).toBeInTheDocument();
    expect(screen.getByText((_, node) => (
      node?.tagName === 'CODE'
      && node.textContent === 'const audio = new Audio("/chime.wav");\nvoid audio.play();'
    ))).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Orbit/ }));
    expect(screen.getByLabelText('Video preview: Orbit')).toHaveAttribute('src', '/orbit.mp4');
    expect(screen.getByText('<video id="media-video" controls src="/orbit.mp4"></video>')).toBeInTheDocument();
    expect(screen.getByText((_, node) => (
      node?.tagName === 'CODE'
      && node.textContent === "const video = document.querySelector('#media-video');\nvoid video?.play();"
    ))).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Orbit/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows an empty state and explicitly caps the shelf at three assets', () => {
    const { rerender } = render(<MediaPanel mediaAssets={[]} themeMode="dark" />);
    expect(screen.getByText('No media assets supplied.')).toBeInTheDocument();

    rerender(
      <MediaPanel
        themeMode="dark"
        mediaAssets={[
          { kind: 'image', name: 'One', src: '/one.jpg', alt: 'One' },
          { kind: 'audio', name: 'Two', src: '/two.mp3' },
          { kind: 'video', name: 'Three', src: '/three.mp4' },
          { kind: 'image', name: 'Four', src: '/four.jpg', alt: 'Four' },
        ]}
      />
    );

    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.queryByRole('tab', { name: /Four/ })).not.toBeInTheDocument();
    expect(screen.getByText('Only the first 3 assets are shown.')).toBeInTheDocument();
  });

  it('escapes host values for the language where each snippet will be pasted', () => {
    const src = 'https://example.test/a"b\\c\n&.png';
    const alt = 'Moon & "stars" <night>';

    render(
      <MediaPanel
        themeMode="dark"
        mediaAssets={[{ kind: 'image', name: 'Escaping', src, alt }]}
      />
    );

    expect(screen.getByText(
      '<img src="https://example.test/a&quot;b\\c&#10;&amp;.png" alt="Moon &amp; &quot;stars&quot; &lt;night&gt;">'
    )).toBeInTheDocument();
    expect(screen.getByText((_, node) => (
      node?.tagName === 'CODE'
      && node.textContent === '.media-image { background-image: url("https://example.test/a\\"b\\\\c\\a &.png"); }'
    ))).toBeInTheDocument();
  });

  it('contains a preview failure to the selected asset', () => {
    render(
      <MediaPanel
        themeMode="light"
        mediaAssets={[
          { kind: 'image', name: 'Broken', src: '/missing.jpg', alt: 'Missing image' },
          { kind: 'audio', name: 'Working', src: '/working.mp3' },
        ]}
      />
    );

    fireEvent.error(screen.getByRole('img', { name: 'Missing image' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load Broken.');

    fireEvent.click(screen.getByRole('tab', { name: /Working/ }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Audio preview: Working')).toBeInTheDocument();
  });

  it('returns selection to the first asset when the host replaces the list', () => {
    const { rerender } = render(
      <MediaPanel
        themeMode="dark"
        mediaAssets={[
          { kind: 'image', name: 'First', src: '/first.jpg', alt: 'First' },
          { kind: 'audio', name: 'Second', src: '/second.mp3' },
        ]}
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: /Second/ }));

    rerender(
      <MediaPanel
        themeMode="dark"
        mediaAssets={[
          { kind: 'video', name: 'Replacement', src: '/replacement.mp4' },
          { kind: 'audio', name: 'Another', src: '/another.mp3' },
        ]}
      />
    );

    expect(screen.getByRole('tab', { name: /Replacement/ })).toHaveAttribute('aria-selected', 'true');
  });
});
