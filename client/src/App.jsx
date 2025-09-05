import { useState } from 'react'
import reactLogo from './assets/react.svg'
import FamilyFeud from './FamilyFeud'
import './App.css'
import PixelBlast from './components/PixelBlast'
function App() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden',
      background: '#000'
    }}>
      {/* Background Layer */}
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        display: 'flex'
      }}>
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#6d00fbff" // Darker purple color
          patternScale={3}
          patternDensity={0.8} // Reduced density for darker feel
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.2}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.4} // Slightly slower for more ambient feel
          edgeFade={0.25}
          transparent={false} // Remove transparency
        />
      </div>
      
      {/* Content Layer */}
      <div style={{ 
        position: 'absolute',
        zIndex: 1,
        inset: 0,
        width: '100vw',
        height: '100vh'
      }}>
        <FamilyFeud />
      </div>
    </div>
    
  )
}

export default App
