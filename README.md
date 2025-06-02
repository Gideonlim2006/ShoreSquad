# 🌊 ShoreSquad

**Rally your crew, track weather, and hit the next beach cleanup with our dope map app!**

## 📋 Project Overview

ShoreSquad is a community-driven web application that mobilizes young people to participate in beach cleanups. Using weather tracking and interactive maps, we make eco-action fun, social, and impactful.

## ✨ Features

- **🗺️ Interactive Event Mapping**: Find beach cleanup events near you with smart filtering
- **🌤️ Weather Intelligence**: Real-time weather tracking for optimal cleanup conditions  
- **👥 Squad Building**: Connect with like-minded eco-warriors in your community
- **📱 Responsive Design**: Optimized for mobile and desktop experiences
- **♿ Accessibility First**: WCAG compliant design for inclusive participation
- **⚡ Performance Optimized**: Fast loading with modern web technologies

## 🎨 Design System

### Color Palette
- **Primary**: Ocean Blue (#1E90FF)
- **Secondary**: Sandy Beige (#F5DEB3)
- **Accent**: Coral (#FF7F50)
- **Success**: Sea Green (#20B2AA)
- **Warning**: Sunset Orange (#FF8C00)
- **Text**: Deep Ocean (#003366)

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights**: 300, 400, 600, 700
- **Responsive scaling** with CSS custom properties

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- [Live Server Extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shoresquad
   ```

2. **Open in VS Code**
   ```bash
   code .
   ```

3. **Start Live Server**
   - Right-click on `index.html`
   - Select "Open with Live Server"
   - Or use the "Go Live" button in VS Code status bar

4. **View in browser**
   - Navigate to `http://localhost:5500`
   - The site will auto-reload when you make changes

### Alternative Setup (Without Live Server)
Simply open `index.html` in your web browser. However, some features like weather API may require a local server.

## 📁 Project Structure

```
shoresquad/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Main stylesheet with CSS custom properties
├── js/
│   └── app.js             # JavaScript application logic
├── .vscode/
│   └── settings.json      # VS Code & Live Server configuration
├── .gitignore             # Git ignore patterns
└── README.md              # Project documentation
```

## 🔧 Technical Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript**: ES6+ features, async/await, modules
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Poppins font family

### APIs & Integrations
- **OpenWeatherMap API**: Real-time weather data
- **Geolocation API**: User location detection
- **Web Share API**: Native sharing capabilities
- **Intersection Observer**: Performance-optimized animations

### Development Tools
- **Live Server**: Development server with hot reload
- **Git**: Version control
- **VS Code**: Recommended editor with configured settings

## 🌟 Key Features Implementation

### Weather Integration
```javascript
// Get current weather for location
async function getWeather() {
    const location = await getCurrentLocation();
    const weatherData = await fetchWeatherData(location);
    displayWeather(weatherData);
}
```

### Event Management
- Dynamic event filtering (today, weekend, this week)
- Real-time participant tracking
- Event sharing capabilities
- Responsive event cards with accessibility

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Optimized for various screen sizes

### Accessibility Features
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences

## 🎯 UX Design Principles

1. **Mobile-First**: Designed primarily for mobile users
2. **Accessibility**: WCAG 2.1 AA compliance
3. **Performance**: Fast loading and smooth interactions
4. **Usability**: Intuitive navigation and clear CTAs
5. **Visual Hierarchy**: Clear information architecture
6. **Progressive Enhancement**: Works without JavaScript

## 📱 Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Environment Variables

For full functionality, you'll need to set up:

```javascript
// In js/app.js, replace with your actual API key
const CONFIG = {
    WEATHER_API_KEY: 'your_openweathermap_api_key',
    // ... other config
};
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Mobile responsiveness (320px - 1200px+)
- [ ] Weather functionality with valid API key
- [ ] Event filtering and interactions
- [ ] Form validation and submission
- [ ] Navigation menu (desktop and mobile)
- [ ] Accessibility with screen reader
- [ ] Performance on slower connections

### Automated Testing (Future)
- Unit tests with Jest
- E2E testing with Playwright
- Accessibility testing with axe-core

## 🚀 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to main branch
4. Your site will be available at `https://username.github.io/shoresquad`

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build command: (none needed for static site)
3. Set publish directory: `/`
4. Deploy automatically on git push

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Follow setup prompts
4. Auto-deploy on git push

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow semantic HTML principles
- Use CSS custom properties for theming
- Write accessible, semantic markup
- Include proper ARIA labels
- Test on multiple devices and browsers
- Optimize for performance

## 📈 Future Enhancements

### Phase 2 Features
- [ ] User authentication and profiles
- [ ] Real-time chat during events
- [ ] Photo sharing and event galleries
- [ ] Gamification with badges and points
- [ ] Push notifications for events
- [ ] Offline functionality (PWA)

### Phase 3 Features
- [ ] Native mobile apps (React Native)
- [ ] Admin dashboard for event organizers
- [ ] Integration with environmental organizations
- [ ] Carbon footprint tracking
- [ ] Advanced analytics and reporting

## 📞 Support

- **Email**: hello@shoresquad.com
- **Documentation**: [Project Wiki](../../wiki)
- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Ocean conservation organizations worldwide
- **Icons**: Font Awesome community
- **Fonts**: Google Fonts (Poppins)
- **Color Palette**: Inspired by ocean and beach environments
- **Accessibility Guidelines**: WCAG 2.1 standards

## 🌊 Making Waves Together

ShoreSquad is more than just an app—it's a movement. Join us in creating cleaner oceans, stronger communities, and a more sustainable future. Every cleanup, every connection, every piece of trash removed makes a difference.

**Ready to make waves? Let's get started! 🏄‍♀️**

---

*Built with 💚 for our oceans*
