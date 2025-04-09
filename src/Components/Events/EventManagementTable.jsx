import React, { useState } from "react";
import {
  Table,
  Button,
  Badge,
  Tooltip,
  Modal,
  Input,
  Form,
  DatePicker,
  Popconfirm,
} from "antd";
import {
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  useAcceptEventMutation,
  useDeclineEventRequestMutation,
  useDeleteEventRequestMutation,
  useGetAllEventQuery,
  useUpdateEventMutation,
} from "../../Redux/Apis/eventApis";
import { url } from "../../Utils/BaseUrl";
import toast from "react-hot-toast";
import { FaEye } from "react-icons/fa6";
import EventAddEditForm from "./EventAddEditForm";
import { FaEdit } from "react-icons/fa";

const EventManagementTable = ({ searchTerm }) => {
  const [page, setPage] = useState(1);
  const [isDisapproveModalVisible, setIsDisapproveModalVisible] =
    useState(false);
  const [isFeaturedModalVisible, setIsFeaturedModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false); // State for the details modal
  const [disapproveReason, setDisapproveReason] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [featuredEndDate, setFeaturedEndDate] = useState(null);
  const { data } = useGetAllEventQuery({ searchTerm, page });
  const [approve] = useAcceptEventMutation();
  const [decline] = useDeclineEventRequestMutation();
  const [deleteEvent] = useDeleteEventRequestMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [open, setOpen] = useState(false);
  const closeModal = () => {
    setOpen(false);
  };
  const handleDisapproveClick = (record) => {
    setSelectedRecord(record);
    setIsDisapproveModalVisible(true);
  };

  const handleApproveModalOk = (record) => {
    approve(record?._id)
      .unwrap()
      .then((res) =>
        toast.success(res?.message || "Event Approved Successfully")
      )
      .catch((err) =>
        toast.error(err?.data?.message || "Something went wrong")
      );
  };

  const handleDelete = (record) => {
    deleteEvent(record?._id)
      .unwrap()
      .then((res) =>
        toast.success(res?.message || "Event Deleted Successfully")
      )
      .catch((err) =>
        toast.error(err?.data?.message || "Something went wrong")
      );
  };

  const handleDisapproveModalOk = () => {
    decline({ id: selectedRecord?._id, reason: disapproveReason })
      .unwrap()
      .then((res) => toast.success(res?.message || "Event Declined"))
      .catch((err) =>
        toast.error(err?.data?.message || "Something went wrong")
      );
    setIsDisapproveModalVisible(false);
    setDisapproveReason("");
    setSelectedRecord(null);
  };

  const handleDisapproveModalCancel = () => {
    setIsDisapproveModalVisible(false);
    setDisapproveReason("");
    setSelectedRecord(null);
  };

  const toggleFeaturedStatus = (record) => {
    console.log(record);
    if (!record.featured) {
      setSelectedRecord(record);
      setIsFeaturedModalVisible(true);
    } else {
      updateFeaturedStatus(record, null, false);
    }
  };

  const updateFeaturedStatus = (record, endDate, isFeatured) => {
    if (isFeatured) {
      // const formData = new FormData()
      // formData.append('featured', endDate)
      updateEvent({ id: record?._id, data: { featured: endDate } })
        .unwrap()
        .then((res) =>
          toast.success(res?.message || "Event Featured Successfully")
        )
        .catch((err) =>
          toast.error(err?.data?.message || "Something went wrong")
        );
    } else {
      // const formData = new FormData()
      // formData.append('featured', '')
      updateEvent({ id: record?._id, data: { featured: null } })
        .unwrap()
        .then((res) => toast.success(res?.message || "Featured Removed"))
        .catch((err) =>
          toast.error(err?.data?.message || "Something went wrong")
        );
    }

    setIsFeaturedModalVisible(false);
    setFeaturedEndDate(null);
    setSelectedRecord(null);
  };

  const handleFeaturedFormSubmit = () => {
    if (featuredEndDate) {
      updateFeaturedStatus(
        selectedRecord,
        featuredEndDate.format("YYYY-MM-DD"),
        true
      );
    }
  };

  const handleDetails = (record) => {
    setSelectedRecord(record);
    setIsDetailsModalVisible(true); // Show the details modal
  };

  const columns = [
    {
      title: "Event Item",
      key: "event_image",
      render: (record) => (
        <img
          src={
            record?.event_image?.[0]
              ? `${url}/${record?.event_image?.[0]}`
              : "https://placehold.co/600x400"
          }
          alt="Event"
          className="w-12 h-12 object-cover rounded-md"
        />
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (_, record) => <span>{record?.category?.name}</span>,
    },
    {
      title: "Start Time",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Starting Date",
      dataIndex: "date",
      key: "date",
      render: (_, record) => (
        // <span>{moment(record?.date).format("MMMM Do")}</span>
        <span>{record?.date?.split("T")?.[0]}</span>
      ),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      render: (_, record) => (
        <span>{record?.end_date?.split("T")?.[0]}</span>
        // <span>{moment(record?.end_date).format("MMMM Do")}</span>
      ),
    },
    {
      title: "Viewed By",
      dataIndex: "favorites",
      key: "favorites",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Featured",
      key: "featured",
      render: (_, record) => (
        <Button
          style={{ width: "110px" }}
          type="text"
          className={`${
            record.featured
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          } px-3 py-1 rounded-md`}
          onClick={() => toggleFeaturedStatus(record)}
        >
          {record.featured ? "Featured" : "Normal"}
        </Button>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex space-x-2">
          {(record?.status == "pending" || record?.status == "updated") && (
            <>
              <Tooltip title="Approve">
                <Button
                  onClick={() => handleApproveModalOk(record)}
                  type="primary"
                  icon={<CheckOutlined />}
                  className="bg-green-500 border-none hover:bg-green-600"
                />
              </Tooltip>
              <Tooltip title="Disapprove">
                <Button
                  type="primary"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleDisapproveClick(record)}
                  className="bg-yellow-500 text-black border-none hover:bg-yellow-600"
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Details">
            <Button
              onClick={() => handleDetails(record)}
              type="primary"
              icon={<FaEye />}
              className="bg-yellow-500 border-none hover:bg-yellow-600"
            />
          </Tooltip>
          <Tooltip title="Details">
            <Button
              onClick={() => {
                setSelectedRecord(record);
                setOpen(true);
              }}
              type="primary"
              icon={<FaEdit />}
              className="bg-yellow-500 border-none hover:bg-yellow-600"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              placement="top"
              title={"Are you sure to delete this event?"}
              description={"Delete the event"}
              onConfirm={() => handleDelete(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                className="bg-red-500 border-none hover:bg-red-600"
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        dataSource={data?.data?.result || []}
        columns={columns}
        pagination={{
          pageSize: data?.data?.meta?.limit || 10,
          total: data?.data?.meta?.total || 0,
          showTotal: (total, range) =>
            `Showing ${range[0]}-${range[1]} of ${total}`,
          position: ["bottomCenter"],
          onChange: (page) => setPage(page),
        }}
      />

      {/* Disapprove Modal */}
      <Modal
        title="Disapprove Event"
        visible={isDisapproveModalVisible}
        onOk={handleDisapproveModalOk}
        onCancel={handleDisapproveModalCancel}
        okText="Submit"
        cancelText="Cancel"
        centered
      >
        <p>Please provide a reason for disapproval:</p>
        <Input.TextArea
          value={disapproveReason}
          onChange={(e) => setDisapproveReason(e.target.value)}
          placeholder="Enter reason here"
          rows={4}
        />
      </Modal>

      {/* Featured End Date Modal */}
      <Modal
        title="Set Featured End Date"
        visible={isFeaturedModalVisible}
        onOk={handleFeaturedFormSubmit}
        onCancel={() => setIsFeaturedModalVisible(false)}
        okText="Confirm"
        cancelText="Cancel"
        centered
      >
        <Form layout="vertical">
          <Form.Item
            label="Featured End Date"
            rules={[
              { required: true, message: "Please select a featured end date!" },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current < moment().endOf("day")
              }
              onChange={(date) => setFeaturedEndDate(date)}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Event Details Modal */}
      <Modal
        title="Event Details"
        visible={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setIsDetailsModalVisible(false)}
            type="primary"
          >
            Close
          </Button>,
        ]}
        centered
        width={800}
      >
        {selectedRecord && (
          <div className="event-details">
            <h3>{selectedRecord.name}</h3>
            <p>
              <strong>Description:</strong> {selectedRecord.description}
            </p>
            <p>
              <strong>Category:</strong> {selectedRecord.category?.name}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {moment(selectedRecord.date).format("MMMM Do YYYY")}
            </p>
            <p>
              <strong>Time:</strong> {selectedRecord.time}
            </p>
            <p>
              <strong>Location:</strong>{" "}
              {selectedRecord.location?.coordinates?.join(", ")}
            </p>
            <p>
              <strong>Social Media Link:</strong>{" "}
              <a
                href={selectedRecord.social_media}
                target="_blank"
                rel="noopener noreferrer"
              >
                {selectedRecord.social_media}
              </a>
            </p>
            <div>
              <strong>Event Images:</strong>
              {/* <div className="event-images">
                                {selectedRecord.event_image?.map((img, index) => (
                                    <img key={index} src={`${url}${img}`} alt={`Event Image ${index + 1}`} className="event-image" />
                                ))}
                            </div> */}
              <div className="event-images">
                <img
                  src={`${url}${selectedRecord?.event_image?.[0]}`}
                  alt={`Event Image`}
                  className="event-image"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={open}
        centered
        onCancel={() => setOpen(false)}
        footer={false}
        width={1000}
      >
        <EventAddEditForm
          selectedData={selectedRecord}
          closeModal={() => closeModal()}
        />
      </Modal>
    </>
  );
};

export default EventManagementTable;
