import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useState, useEffect } from "react";
import Mytasks from "../components/Mytasks.css";
import Card from "react-bootstrap/Card";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import EditTasks from "./EditTasks.js";
import Button from "react-bootstrap/Button";
import { useParams } from "react-router-dom";
import { VscEdit } from "react-icons/vsc";
import { BsTrash } from "react-icons/bs";
import Spinner from "react-bootstrap/Spinner";

function MyTasks() {
  const { id } = useParams();
  const [selectedTask, setSelectedTask] = useState();
  const [taskList, setTaskList] = useState([]);
  const [taskObj, setTaskObj] = useState({
    name: "",
    status: "Todo"
  });
  const [columns, setColumns] = useState({
    todo: {
      name: "Todo",
      items: [],
    },
    doing: {
      name: "Doing",
      items: [],
    },
    done: {
      name: "Done",
      items: [],
    },
  });

  const [loading, setLoading] = useState(true);

  const handleShow = (id) => {
    setSelectedTask(id);
    setShowModal(true);
  };
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);

  useEffect(() => {
    async function fetchTask() {
      try {
        const responseTask = await axios.get(
          `https://ironrest.herokuapp.com/cardinatortasks/`
        );
        setTaskList([...responseTask.data]);
        const todo = responseTask.data.filter(task => task.status === "Todo" && task.projectId === id);
        const doing = responseTask.data.filter(task => task.status === "Doing" && task.projectId === id);
        const done = responseTask.data.filter(task => task.status === "Done" && task.projectId === id);

        setColumns({
          todo: {
            name: "Todo",
            items: [...todo],
          },
          doing: {
            name: "Doing",
            items: [...doing],
          },
          done: {
            name: "Done",
            items: [...done],
          },
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    }
    fetchTask();
  }, []);

  async function fetchDeletion(selectedTask) {
    try {
       await axios.delete(
        `https://ironrest.herokuapp.com/cardinatortasks/${selectedTask}`
      );
      refreshPage();
    } catch (err) {
      console.error(err);
    }
    fetchDeletion();
  }

  function handleClick() {
    async function fetchData() {
      try {
        const addNewTask = await axios.post(
          "https://ironrest.herokuapp.com/cardinatortasks/",
          taskObj
        );
        refreshPage();
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }

  function handleUpdate() {
    async function fetchUpdate() {
      try {
        const updateTask = await axios.put(
          `https://ironrest.herokuapp.com/cardinatortasks/${selectedTask}`,
          taskObj
        );
        refreshPage();
      } catch (err) {
        console.error(err);
      }
    }
    fetchUpdate();
    handleClose();
  }

  function handleChange(event) {
    setTaskObj({ ...taskObj, projectId: id, [event.target.name]: event.target.value });
  }

  function refreshPage() {
    window.location.reload(false);
  }
  
  function handleOnDragEnd(result, columns, setColumns) {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId]; //coluna de origem
      const destColumn = columns[destination.droppableId]; //coluna de destino
      const sourceItems = [...sourceColumn.items]; //item de origem = ...colunadedestino. items
      const destItems = [...destColumn.items];
      const [reorderedItem] = sourceItems.splice(source.index, 1);
      reorderedItem.status = destColumn.name;
      destItems.splice(destination.index, 0, reorderedItem);

      
      fetchUpdate(reorderedItem);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });
    }
  }
  
     async function fetchUpdate(task) {
      const taskId = task._id;
      delete task._id
    
       try {
          await axios.put(
           `https://ironrest.herokuapp.com/cardinatortasks/${taskId}`, task
         );
       } catch (err) {
         console.error(err);
       }
     }
  
   
  return (
    <>
      {loading ? (
        <Spinner style={{height: "10rem", width: "10rem", marginTop: "15rem"}} variant="secondary" animation="border" />
      ) : (
        <div
          style={{
            display: "flex",
            marginLeft: "12vh",
            marginTop: "12vh",
            justifyContent: "space-around",
          }}
        >
          <DragDropContext
            onDragEnd={(result) => handleOnDragEnd(result, columns, setColumns)}
          >
            {Object.entries(columns).map(([columnId, column]) => {
              return (
                <Card
                  style={{ borderRadius: "0.5rem", width: "21rem" }}
                  key={columnId}
                >
                  <Card.Header className="card-header">
                    <h5 style={{ margin: "0" }}>{column.name}</h5>
                  </Card.Header>
                  <Card.Body style={{ backgroundColor: "#ededed" }}>
                    <Droppable droppableId={columnId} key={columnId}>
                      {(droppableProvided, droppableSnapshot) => (
                        <div
                          {...droppableProvided.droppableProps}
                          ref={droppableProvided.innerRef}
                          key={columnId}
                          style={{
                            background: droppableSnapshot.isDraggingOver
                              ? "#d3d3d3"
                              : "#ededed",
                            width: "100%",
                            // height: "50%",
                          }}
                          onScroll={(e) =>
                            console.log(
                              "current scrollTop",
                              e.currentTarget.scrollTop
                            )
                          }
                        >
                          <ul
                            className="list-group "
                            style={{ listStyle: "none" }}
                            key={columnId}
                          >
                            {column.items?.map((currentTask, index) => (
                              <div
                                key={currentTask._id}
                                draggableid={currentTask._id}
                              >
                                <Draggable
                                  key={currentTask._id}
                                  draggableId={String(currentTask._id)}
                                  index={index}
                                >
                                  {(droppableProvided, droppableSnapshot) => (
                                    <div
                                      {...droppableProvided.draggableProps}
                                      {...droppableProvided.dragHandleProps}
                                      ref={droppableProvided.innerRef}
                                      style={{
                                        ...droppableProvided.draggableProps
                                          .style,
                                      }}
                                    >
                                      <li
                                        className="list-group-item mb-2"
                                        key={currentTask._id}
                                        style={{
                                          textAlign: "initial",
                                          paddingRight: "3.2rem",
                                        }}
                                      >
                                        {currentTask.name}

                                        <div style={{ display: "inline-flex" }}>
                                          <div>
                                            <Button
                                              style={{
                                                // heigth: "0.5rem",
                                                position: "absolute",
                                                left: "16rem",
                                                bottom: "0.3rem",
                                                border: "none",
                                              }}
                                              variant="outline-secondary"
                                              size="sm"
                                              border="none"
                                              onClick={() =>
                                                handleShow(currentTask._id)
                                              }
                                            >
                                              <VscEdit />
                                            </Button>
                                            <Button
                                              style={{
                                                position: "absolute",
                                                left: "14rem",
                                                bottom: "0.3rem",
                                                border: "none",
                                              }}
                                              variant="outline-secondary"
                                              size="sm"
                                              border="none"
                                              onClick={() =>
                                                fetchDeletion(currentTask._id)
                                              }
                                            >
                                              <BsTrash />
                                            </Button>
                                          </div>
                                        </div>
                                      </li>
                                    </div>
                                  )}
                                </Draggable>
                              </div>
                            ))}
                            {droppableProvided.placeholder}
                          </ul>
                        </div>
                      )}
                    </Droppable>
                    {column.name === "Todo" && (
                      <div>
                        <input
                          onChange={handleChange}
                          value={taskObj.name}
                          name="name"
                          style={{ marginTop: "1rem", width: "18rem" }}
                          type="form"
                        />
                        <div>
                          <button
                            onClick={() => {
                              handleClick();
                            }}
                            style={{
                              marginRight: "1rem",
                              marginLeft: "8.8rem",
                            }}
                            className="btn btn-secondary mt-2"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </DragDropContext>
          <EditTasks
            show={showModal}
            handleClose={handleClose}
            handleUpdate={handleUpdate}
            handleChange={handleChange}
            value={taskObj.name}
            name={"name"}
          />
        </div>
      )}
      {/* <button ></button> */}
    </>
  );
}
export default MyTasks;
