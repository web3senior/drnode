import { Link } from 'react-router-dom'
import MaterialIcon from './../helper/MaterialIcon'

const Heading = (props) => (
  <Link to={`../tools`} className='heading'>
    <MaterialIcon name="arrow_back_ios" />
    <span>{props.title}</span>
  </Link>
)

export default Heading

Heading.defaultProps = {
  title: 'NoTitle',
  lead: '',
}
