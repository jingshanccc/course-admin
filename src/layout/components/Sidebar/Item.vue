<script>
export default {
	name: 'MenuItem',
	functional: true,
	props: {
		icon: {
			type: String,
			default: ''
		},
		title: {
			type: String,
			default: ''
		}
	},
	render(h, context) {
		const {icon, title} = context.props
		const nodes = []

		if (icon) {
			nodes.push(<svg-icon icon-class={icon}/>)
		}
		if (title) {
			nodes.push(<span slot = 'title'>{{title}}</span>)
		}
		return nodes
	}
}
</script>