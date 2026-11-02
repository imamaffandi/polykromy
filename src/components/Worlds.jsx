import { useRef } from 'react'
import { WorldsField } from '../gl/WorldsField'

export function Worlds() {
  const section = useRef(null)
  const depth = useRef(null)

  return (
    <section className="worlds" id="worlds" ref={section}>
      <WorldsField sectionRef={section} depthRef={depth} />
      <div className="worlds__overlay">
        <p className="worlds__label mono">[ Distinctive worlds ]</p>
        <div className="worlds__copy">
          <h2 className="worlds__title">From interactive worlds to wearable designs.</h2>
          <p>We bring ideas to life through experimentation, thoughtful design, and a passion for play.</p>
        </div>
        <dl className="worlds__readout mono">
          <div>
            <dt>Camera Z</dt>
            <dd>
              <output ref={depth}>+12.00</output>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
