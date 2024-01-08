const Icon = (props) => (
  <span className={`material-symbols-outlined ${props.className ? props.className : null}`} style={props.style}>
    {props.name}
  </span>
)
export default Icon
