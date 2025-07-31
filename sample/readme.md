# Heavy Render Website

A high-performance website designed to stress-test browser rendering capabilities using vanilla JavaScript, HTML5, and Tailwind CSS.

## Features

- 🎨 **Complex Animations**: Multiple CSS keyframe animations running simultaneously
- 🌊 **Particle System**: Continuous floating particles across the screen
- 🎯 **Canvas Rendering**: 100+ animated objects with physics and glow effects
- 🔥 **Heavy DOM Operations**: Dynamic creation and animation of thousands of elements
- 📊 **Performance Monitor**: Real-time FPS, element count, and memory usage tracking
- ✨ **Visual Effects**: Morphing shapes, gradient text, glass effects, and neon glows

## Performance Features

- **Continuous Rendering**: Multiple `requestAnimationFrame` loops
- **Complex CSS**: Heavy use of transforms, filters, and animations
- **Memory Intensive**: Large DOM trees and continuous element creation/destruction
- **Event Handling**: Multiple event listeners and timers
- **Real-time Monitoring**: Live performance metrics

## Deployment

This website is deployed on Render as a static site.

## Local Development

```bash
npm install
npm start
```

The website will be available at `http://localhost:3000`

## Browser Performance

This website is intentionally designed to be resource-intensive. It may cause:
- High CPU usage
- Increased memory consumption
- Reduced FPS on lower-end devices
- Browser lag or unresponsiveness

Use with caution and monitor your system resources!

## Tech Stack

- **HTML5** - Semantic markup and Canvas API
- **CSS3** - Advanced animations and effects
- **Vanilla JavaScript** - Performance-critical rendering operations
- **Tailwind CSS** - Utility-first styling framework

## License

MIT License
