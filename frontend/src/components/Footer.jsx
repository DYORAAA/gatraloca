import { adminDashboardUrl } from '../api/students'

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <h3>GATRALOCA <span>58</span></h3>
          <p>Berbeda jalan, tetap satu kenangan.</p>
        </div>
        <a href={adminDashboardUrl}>Dashboard admin <span aria-hidden="true">↗</span></a>
        <small>© 2026 GATRALOCA · SMKN 2 PROBOLINGGO</small>
      </div>
    </footer>
  )
}
