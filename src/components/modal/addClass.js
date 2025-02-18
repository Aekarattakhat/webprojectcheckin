import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#__next");
const AddClassModal = ({showAddClassModal}) =>{

    return (
    <Modal isOpen={showAddClassModal} onRequestClose={() => this.setState({ showAddClassModal: false })}>
    <Modal.Header closeButton>
        <Modal.Title>Add New Class</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form>
            <Form.Group>
                <Form.Label>Class Name</Form.Label>
                <Form.Control type="text" value={this.state.newClassName} onChange={(e) => this.setState({ newClassName: e.target.value })} />
            </Form.Group>
        </Form>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={() => this.setState({ showAddClassModal: false })}>Cancel</Button>
        <Button variant="primary" onClick={this.handleClassSubmit}>Add</Button>
    </Modal.Footer>
    </Modal>
    )
}

export default AddClassModal