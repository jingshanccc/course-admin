<template>
	<el-scrollbar ref="scrollContainer" :vertical="false" class="scroll-container" @wheel.native.prevent="handleScroll">
		<slot />
	</el-scrollbar>
</template>

<script>
const tagAndTagSpacing = 4 // 标签间间隔
export default {
	name: 'ScrollPane',
	data() {
		return {
			left: 0
		}
	},
	computed: {
		scrollWrapper() {
			return this.$refs.scrollContainer.$refs.wrap
		}
	},
	methods: {
		handleScroll(e) {
			const eventDelta = e.wheelDelta || -e.deltaY * 40
			const $scrollWrapper = this.scrollWrapper
			$scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4
		},
		moveToTarget(currentTag) {
			const $container = this.$refs.scrollContainer.$el
			const $containerWidth = $container.offsetWidth
			const $scrollWrapper = this.scrollWrapper
			const tagList = this.$parent.$refs.tag

			let firstTag = null
			let lastTag = null
			if (tagList.length > 0) {
				firstTag = tagList[0]
				lastTag = tagList[tagList.length - 1]
			}
			if (firstTag === currentTag) {
				$scrollWrapper.scrollLeft = 0
			} else if (lastTag === currentTag) {
				$scrollWrapper.scrollLeft = $scrollWrapper.scrollWidth - $containerWidth
			} else {
				//获取前后的两个标签
				const curIndex = tagList.findIndex(item => item === currentTag)
				const preTag = tagList[curIndex - 1]
				const nextTag = tagList[curIndex + 1]
				//获取移动的长度
				const afterNextOffSetLeft = nextTag.$el.offsetLeft + nextTag.$el.offsetWidth + tagAndTagSpacing
				const beforePreOffsetLeft = preTag.$el.offsetLeft - tagAndTagSpacing

				if (afterNextOffSetLeft > $scrollWrapper.scrollLeft + $containerWidth) {
					$scrollWrapper.scrollLeft = afterNextOffSetLeft - $containerWidth
				} else if (beforePreOffsetLeft < $scrollWrapper.scrollLeft) {
					$scrollWrapper.scrollLeft - beforePreOffsetLeft
				}
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.scroll-container {
	white-space: nowrap;
	position: relative;
	overflow: hidden;
	width: 100%;
	::v-deep {
		.el-scrollbar__bar {
			bottom: 0
		}
		.el-scrollbar__wrap {
			height: 49px;
		}
	}
}
</style>