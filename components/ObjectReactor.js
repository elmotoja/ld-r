import React from 'react';
import {provideContext, connectToStores} from 'fluxible-addons-react';
import loadObjectProperties from '../actions/loadObjectProperties';
import IndividualObjectStore from '../stores/IndividualObjectStore';
import {navigateAction} from 'fluxible-router';
import IndividualObject from './IndividualObject';
import AggregateObject from './AggregateObject';

class ObjectReactor extends React.Component {
    constructor(props) {
        super(props);
    }
    includesProperty(list, resource, property) {
        let out = false;
        list.forEach(function(el) {
            if (el.r === resource && el.p === property){
                out = true;
                return out;
            }
        });
        return out;
    }
    checkAccess(user, graph, resource, property) {
        if(this.props.enableAuthentication) {
            if(user){
                if(parseInt(user.isSuperUser)){
                    return {access: true, type: 'full'};
                }else{
                    if(graph && user.editorOfGraph.indexOf(graph) !== -1){
                        return {access: true, type: 'full'};
                    }else{
                        if(resource && user.editorOfResource.indexOf(resource) !== -1){
                            return {access: true, type: 'full'};
                        }else{
                            if(property && this.includesProperty(user.editorOfProperty, resource, property)){
                                return {access: true, type: 'partial'};
                            }else{
                                return {access: false};
                            }
                        }
                    }
                }
            }else{
                return {access: false};
            }
        }else{
            return {access: true, type: 'full'};
        }
    }
    //considers 0 elements
    calculateValueCount (instances){
        let count = 0;
        instances.forEach(function(v, i) {
            if(instances[i]){
                count++;
            }
        });
        return count;
    }
    //removes properties from an object
    configMinus(config, props) {
        let o = {};
        for(let p in config) {
            if(props.indexOf(p) === -1){
                o [p] = config [p];
            }
        }
        return o;
    }
    render() {
        let self = this;
        let user = this.context.getUser();
        let list;
        //check if it is the only value of a property -> used to hide delete button
        let isOnlyChild = (this.calculateValueCount(this.props.spec.instances) === 1);
        let accessLevel, readOnly;
        if(this.props.config && this.props.config.objectReactor){
            switch(this.props.config.objectReactor[0]){
                case 'IndividualObject':
                    list = this.props.spec.instances.map(function(node, index) {
                        if(!node){
                            return undefined; // stop processing this iteration
                        }
                        //check access level for details
                        readOnly = self.props.readOnly;
                        if(node.extended){
                            accessLevel = self.checkAccess(user, self.props.graphName, self.props.resource, '');
                            if(!accessLevel.access){
                                readOnly = true;
                            }
                        }
                        return (
                            <IndividualObject key={index} inEditMode={self.props.inEditMode} isNewValue={self.props.isNewValue} readOnly={readOnly} spec={node} graphName={self.props.graphName} resource={self.props.resource} property={self.props.spec.propertyURI} isOnlyChild={isOnlyChild}
                            onCreate={self.props.onCreateIndividualObject.bind(self)} onDelete={self.props.onDeleteIndividualObject.bind(self)} onUpdate={self.props.onUpdateIndividualObject.bind(self)} onDetailCreate={self.props.onDetailCreateIndividualObject.bind(self)} onDetailUpdate={self.props.onDetailUpdateIndividualObject.bind(self)} config={self.configMinus(self.props.config, ['objectReactor'])}/>
                        );
                    });
                break;
                case 'AggregateObject':
                    list = <AggregateObject inEditMode={self.props.inEditMode} isNewValue={self.props.isNewValue} readOnly={self.props.readOnly} spec={self.props.node} graphName={self.props.graphName} resource={self.props.resource} property={self.props.spec.propertyURI} onIndividualDelete={self.props.onDeleteIndividualObject.bind(self)} onIndividualUpdate={self.props.onUpdateIndividualObject.bind(self)} onDelete={self.props.onDeleteAggObject.bind(self)} onUpdate={self.props.onUpdateAggObject.bind(self)} onDetailCreate={self.props.onDetailCreateIndividualObject.bind(self)} onDetailUpdate={self.props.onDetailUpdateIndividualObject.bind(self)} controlNewInsert={self.props.onControlNewInsert.bind(self)} config={self.configMinus(self.props.config, ['objectReactor'])}/>;
                break;
                default:
                    list = this.props.spec.instances.map(function(node, index) {
                        if(!node){
                            return undefined; // stop processing this iteration
                        }
                        //check access level for details
                        readOnly = self.props.readOnly;
                        if(node.extended){
                            accessLevel = self.checkAccess(user, self.props.graphName, self.props.resource, '');
                            if(!accessLevel.access){
                                readOnly = true;
                            }
                        }
                        return (
                            <IndividualObject key={index} inEditMode={self.props.inEditMode} isNewValue={self.props.isNewValue} readOnly={readOnly} spec={node} graphName={self.props.graphName} resource={self.props.resource} property={self.props.spec.propertyURI} isOnlyChild={isOnlyChild}
                            onCreate={self.props.onCreateIndividualObject.bind(self)} onDelete={self.props.onDeleteIndividualObject.bind(self)} onUpdate={self.props.onUpdateIndividualObject.bind(self)} onDetailCreate={self.props.onDetailCreateIndividualObject.bind(self)} onDetailUpdate={self.props.onDetailUpdateIndividualObject.bind(self)} config={self.configMinus(self.props.config, ['objectReactor'])}/>
                        );
                    });
            }
        }
        return (
            <div ref="objectReactor">
                {list}
            </div>
        );
    }
}
ObjectReactor.contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getUser: React.PropTypes.func
};
ObjectReactor = connectToStores(ObjectReactor, [IndividualObjectStore], function (context, props) {
    return {
        ObjectReactor: context.getStore(IndividualObjectStore).getState()
    };
});
export default ObjectReactor;