import React, { Component } from 'react'
import mobile from '../Services/mobile'
import styles from './BlendedBackground.scss'
import { coreLibrary } from 'kambi-wc-widget-core-library'

/**
 * Desktop background file path
 * @type {string}
 */
const BG_IMAGE_DESKTOP = 'http://localhost:9090/assets/overview-bw-bg-desktop.jpg'

/**
 * Mobile background file path
 * @type {string}
 */
const BG_IMAGE_MOBILE = 'http://localhost:9090/assets/overview-bw-bg-mobile.jpg/'

/**
 * Displays a background image which is blended with actual operator's color theme.
 */
class BlendedBackground extends Component {
  /**
   * Constructs.
   * @param props
   */
  constructor(props) {
    super(props)
    this.state = { mobile: mobile() }
    this.onResize = this.onResize.bind(this)
  }

  /**
   * Called after component mounting.
   */
  componentDidMount() {
    window.addEventListener('resize', this.onResize)
  }

  /**
   * Called just before component unmounting.
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  /**
   * Handles window resize.
   */
  onResize() {
    if (mobile() != this.state.mobile) {
      this.setState({ mobile: !this.state.mobile })
    }
  }

  cssRender() {
    let url = this.state.mobile ? BG_IMAGE_MOBILE : BG_IMAGE_DESKTOP
    return (
      <div
        className={`${styles.backgroundContainer} KambiWidget-primary-color`}
        style={{
          backgroundColor: 'currentColor',
        }}
      >
        <div
          className={`${styles.background}`}
          style={{
            backgroundImage: `url(${url})`,
            backgroundRepeat: 'no-repeat',
            mixBlendMode: 'multiply',
            backgroundSize: 'cover',
          }}
        />
      </div>
    )
  }

  svgRender() {
    return (
      <div className={styles.backgroundContainer}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className={styles.background}
        >
          <defs>
            <filter id="filter">
              <feImage
                result="slide2"
                x="0"
                y="0"
                width="100%"
                preserveAspectRatio="xMidYMid slice"
                xlinkHref={
                  this.state.mobile ? BG_IMAGE_MOBILE : BG_IMAGE_DESKTOP
                }
              />
              <feBlend in2="SourceGraphic" in="slide2" mode="multiply" />
            </filter>
          </defs>
          <rect
            className={`KambiWidget-primary-color ${styles.blendRect}`}
            x="0"
            y="0"
            filter="url(#filter)"
            width="100%"
            height="100%"
          />
        </svg>
      </div>
    )
  }

  render() {
    /*
      as of firefox 55.0, firefox has a bug with the way we render the svg
      as a workaround we render the same thing using the new CSS mixBlendMode
      property. This property is not supported in IE so the main way to render
      this should still be using the SVG render
      */
    
      return this.cssRender()

  }
}

export default BlendedBackground
