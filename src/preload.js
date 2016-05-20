import React, {Component} from 'react'
import {LOADER_FIELD} from './constants'

import {connect} from 'react-redux'
import hoist from 'hoist-non-react-statics'
import invariant from 'invariant'

const mapStateToProps = state => ({
    preloadState: state.preload,
    state
})

const mapDispatchToProps = dispatch => ({
    dispatch
})

const preload = promiseCreator => WrappedComponent => {

    class Preload extends Component {

        constructor() {
            super()
            this.state = {
                loading: false
            }
        }

        componentWillReceiveProps(newProps) {
            const oldId = this.props.state.router.id
            const newId = newProps.state.router.id

            if (oldId !== newId) {
                this.preloadData()
            }
        }

        componentWillMount() {
            this.preloadData()
        }

        preloadData() {
            const {preloadState, dispatch, state, ...ownProps} = this.props

            if (!preloadState.loadedOnServer || preloadState.shouldReloadAfterServerPreload) {
                this.setState({
                    loading: true
                })

                const promise = promiseCreator(dispatch, state, ownProps)

                invariant(promise && promise.then, `first argument of the preload decorator should return a promise`)

                promise
                    .then(() =>
                        this.setState({
                            loading: false
                        }))
            }
        }

        render() {
            const {loading} = this.state

            const props = {
                loading,
                ...this.props
            }

            return <WrappedComponent {...props} />

        }
    }

    Preload[ LOADER_FIELD ] = promiseCreator

    const ResultPreload = hoist(Preload, WrappedComponent)

    return connect(mapStateToProps, mapDispatchToProps)(ResultPreload)
}

export default preload
