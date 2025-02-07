import PropTypes from 'prop-types'
import React from 'react'

import ComponentsImg from 'src/assets/images/components.webp'

const DocsComponents = (props) => (
  <div className="bg-primary bg-opacity-10 border border-2 border-primary rounded mb-4">
    <div className="row d-flex align-items-center p-3 px-xl-4 flex-xl-nowrap">
      <div className="col-xl-auto col-12 d-none d-xl-block p-0">
        <img
          className="img-fluid"
          src={ComponentsImg}
          width="160px"
          height="160px"
          alt="CoreUI PRO hexagon"
        />
      </div>
      <div className="col-md col-12 px-lg-4">
        Our School Management System is blend of multiple options to manage school.It’s{' '}
        <strong>powered by string automation that has team highly dedicated members.</strong>.We
        offer highly customised solutions.
      </div>
      <div className="col-md-auto col-12 mt-3 mt-lg-0">
        <a
          className="btn btn-primary text-nowrap text-white"
          href={``}
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore Documentation
        </a>
      </div>
    </div>
  </div>
)

DocsComponents.propTypes = {
  href: PropTypes.string,
}

export default DocsComponents
