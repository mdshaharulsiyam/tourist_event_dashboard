import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Upload,
  Modal,
  Checkbox,
} from "antd";
import React, { useEffect, useState } from "react";
import { FaUpload } from "react-icons/fa";
import { FaLocationPin } from "react-icons/fa6";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import Editor from "../Shared/Editor";
import GetCoordinateMap from "./GetCoordinateMap";
import {
  useCreateEventMutation,
  useUpdateEventsMutation,
} from "../../Redux/Apis/eventApis";
import { useGetCategoryQuery } from "../../Redux/Apis/categoryApi";
import { useGetVendorsQuery } from "../../Redux/Apis/vendorApis";
import moment from "moment";

const EventAddEditForm = ({ selectedData, closeModal }) => {
  const [form] = Form.useForm();

  const [Loading, setLoading] = useState(false);
  const { data: vendors, isFetching } = useGetVendorsQuery({
    page: 1,
    limit: 9999999999,
  });
  const [text, setText] = useState("");
  const [textS, setTextS] = useState("");
  const [locationData, setLocationData] = useState();
  const [open, setOpen] = useState(false);
  const { data: category, isLoading } = useGetCategoryQuery();
  const [renew, setRenew] = useState("none");
  const [isFeatured, setIsFeatured] = useState(false);
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventsMutation();

  const onFinish = (values) => {
    if (!selectedData && values?.img?.length <= 0) {
      toast.error("Please select event image");
    }
    // values.event_image = values.event_image?.[0]?.originFileObj;
    // values.date = dayjs(values?.date).toDate().toISOString(); //new Date(dayjs(values?.date).toDate().toISOString());
    values.date = dayjs(values?.date).add(1, "day").toDate().toISOString();
    values.recurrence_end = dayjs(values?.recurrence_end)
      .toDate()
      .toISOString();
    // values.end_date = dayjs(values?.end_date).toDate().toISOString();
    values.end_date = dayjs(values?.end_date)
      .add(1, "day")
      .toDate()
      .toISOString();
    values.time = dayjs(values?.time).format("hh:mm A");
    values.end_time = dayjs(values?.end_time).format("hh:mm A");

    values.latitude = locationData?.lng;
    values.longitude = locationData?.lat;
    values.description = text;
    values.spanishDescription = textS;
    values.recurrence = renew;
    if (isFeatured) {
      values.featured = dayjs(values?.featuredDate).toDate().toISOString();
    }
    const { img, tag, featuredDate, ...otherFields } = values;
    const formData = new FormData();
    Object.keys(otherFields)?.map((key) => {
      const value = otherFields[key];
      if (value) {
        formData.append(key, value);
      }
    });
    if (values?.tag) {
      values?.tag?.map((item) => {
        formData.append("option[]", item);
      });
      formData.append("event_image", values?.img?.[0]?.originFileObj);
    }
    formData.append("event_image", values?.img?.[0]?.originFileObj);
    if (selectedData?._id) {
      updateEvent({ id: selectedData._id, data: formData })
        .unwrap()
        .then((res) => {
          toast.success(res?.message || "Event Create Successfully");
          closeModal();
        })
        .catch((err) => {
          toast.error(err?.data?.message || "Something went wrong");
        });
    } else {
      createEvent(formData)
        .unwrap()
        .then((res) => {
          toast.success(res?.message || "Event Updated Successfully");
          closeModal();
        })
        .catch((err) => {
          toast.error(err?.data?.message || "Something went wrong");
        });
    }
  };

  const handleFeaturedChange = (e) => {
    setIsFeatured(e.target.checked);
  };
  useEffect(() => {
    if (selectedData) {
      form.setFieldsValue({
        name: selectedData?.name,
        category: selectedData?.category?._id,
        // date: dayjs(selectedData?.date),
        date: dayjs(selectedData?.date).subtract(1, "day"),
        time: moment(selectedData?.time, "h:mm A"),
        end_time: moment(selectedData?.end_time, "h:mm A"),
        // end_date: dayjs(selectedData?.end_date),
        end_date: dayjs(selectedData?.end_date).subtract(1, "day"),
        description: selectedData?.description,
        spanishDescription: selectedData?.spanishDescription,
        address: selectedData?.address,
        social_media: selectedData?.social_media,
        tag: selectedData?.option,
        recurrence: selectedData?.recurrence,
        recurrence_end: dayjs(selectedData?.recurrence_end),
        featured: selectedData.featured,
        featuredDate: selectedData.featured
          ? dayjs(selectedData?.featured)
          : dayjs(selectedData?.featuredDate),
        vendor: selectedData?.vendor?._id,
        // img: imageUrl(selectedData?.event_image)
      });
      setText(selectedData?.description);
      setTextS(selectedData?.spanishDescription);
      setLocationData({
        lat: selectedData.latitude,
        lng: selectedData.longitude,
        display_name: selectedData.address,
      });
      setIsFeatured(!!selectedData.featured);
    }
  }, [selectedData]);
  useEffect(() => {
    form.setFieldsValue({
      vendor: selectedData?.vendor?._id,
    });
  }, [vendors?.data?.result]);
  useEffect(() => {
    if (locationData?.display_name) {
      form.setFieldsValue({
        address: locationData?.display_name,
      });
    }
  }, [locationData]);
  // useEffect(() => {
  //     // if (data?.data?.address) {
  //     //     form.setFieldsValue({ address: data?.data?.address })
  //     // }
  //     // setLocationData({ lat: data?.data?.location_map?.coordinates?.[0], lng: data?.data?.location_map?.coordinates?.[1], display_name: data?.data?.address });
  // }, [form,])
  return (
    <div className="p-4">
      <p className="text-2xl text-center mb-2">Add Event</p>
      <Form
        form={form}
        className="grid-2"
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Event Name"
          name="name"
          rules={[{ required: true, message: "Please input the event name!" }]}
        >
          <Input placeholder="Enter auction item name" />
        </Form.Item>

        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: "Please select a category!" }]}
        >
          <Select
            className=""
            placeholder="Select Category"
            options={
              category?.data?.map((item) => ({
                label: item?.name,
                value: item?._id,
              })) || []
            }
          />
        </Form.Item>
        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: "Please select the date!" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Time"
          name="time"
          rules={[{ required: true, message: "Please select the time!" }]}
        >
          <TimePicker use12Hours format="h:mm a" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="End Date"
          name="end_date"
          rules={[{ required: true, message: "Please select the End date!" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="End Time"
          name="end_time"
          rules={[{ required: true, message: "Please select the time!" }]}
        >
          <TimePicker use12Hours format="h:mm a" style={{ width: "100%" }} />
        </Form.Item>
        {/* 
                <Form.Item<FieldType>
                    label="Duration"
                    name="duration"
                >
                    <Input placeholder="e.g., 3h 45m" />
                </Form.Item> */}

        <Form.Item
          className={`col-span-2`}
          label="Tag"
          name="tag"
          rules={[{ required: false, message: "Please select a Tag!" }]}
        >
          <Select mode="multiple" placeholder="Select Tag">
            <Select.Option value="Family Friendly">
              Family Friendly
            </Select.Option>
            <Select.Option value="Free">Free</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Social Media Link" name="social_media">
          <Input type="url" placeholder="Select your media link" />
        </Form.Item>

        <div className="relative">
          <Form.Item
            name={`address`}
            label={`Location`}
            rules={[{ required: true, message: "Location is required" }]}
          >
            <Input placeholder="location" className="h-[42px]" />
          </Form.Item>
          <button
            type="button"
            className="button-blue ml-auto absolute top-10 right-2"
            style={{
              padding: "5px 5px",
            }}
            onClick={() => {
              setOpen(true);
            }}
          >
            <FaLocationPin />
          </button>
        </div>
        {!selectedData && (
          <Form.Item
            className="col-span-2"
            label="Choose a Vendor"
            name="vendor"
            rules={[{ required: true, message: "Please select a category!" }]}
          >
            <Select
              showSearch
              className=""
              placeholder="Select Category"
              options={
                vendors?.data?.result?.map((item) => ({
                  label: item?.name,
                  value: item?._id,
                })) || []
              }
            />
          </Form.Item>
        )}

        <Form.Item
          className={`col-span-2`}
          label="Description"
          name="description"
          // rules={[{ required: true, message: 'Please enter a description!' }]}
        >
          <Editor content={text} setContent={setText} />
        </Form.Item>
        {/* <Form.Item
          className={`col-span-2`}
          label="Spanish Description"
          name="spanishDescription"
          // rules={[{ required: true, message: 'Please enter a description!' }]}
        >
          <Editor content={textS} setContent={setTextS} />
        </Form.Item> */}

        <Form.Item name="featured" valuePropName="checked">
          <Checkbox onChange={handleFeaturedChange}>
            Make this Featured{" "}
          </Checkbox>
        </Form.Item>

        <Form.Item
          label="Featured End Date"
          name="featuredDate"
          rules={[
            { required: isFeatured, message: "Please select a featured date!" },
          ]}
        >
          <DatePicker style={{ width: "100%" }} disabled={!isFeatured} />
        </Form.Item>

        <Form.Item label="Recurrence" name="recurrence">
          <Select
            defaultValue={renew}
            value={renew}
            onChange={(value) => setRenew(value)}
            options={[
              { label: "Unavailable", value: "none" },
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
              { label: "Yearly", value: "yearly" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label={`Recurrence ${renew == "none" ? "Unavailable" : "Until"} `}
          name="recurrence_end"
          rules={[
            {
              required: renew != "none",
              message: "Please select a featured date!",
            },
          ]}
        >
          <DatePicker style={{ width: "100%" }} disabled={renew == "none"} />
          {/* {
                        renew == 'weekly' ? < Select
                            placeholder='please select day'
                            defaultValue={`Friday`}
                            options={[
                                { label: 'Monday', value: 'monday' },
                                { label: 'Tuesday', value: 'tuesday' },
                                { label: 'Wednesday', value: 'wednesday' },
                                { label: 'Thursday', value: 'thursday' },
                                { label: 'Friday', value: 'friday' },
                                { label: 'Saturday', value: 'saturday' },
                                { label: 'Sunday', value: 'sunday' }
                            ]}
                        /> :''  } */}
        </Form.Item>

        <Form.Item
          className={`col-span-2`}
          label="Image"
          name="img"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
        >
          <Upload listType="picture-card" maxCount={1}>
            <div className="center-center flex-col">
              <FaUpload />
              <div style={{ marginTop: 8 }}>Add Image</div>
            </div>
          </Upload>
        </Form.Item>

        <div className="col-span-2 center-center gap-2 w-full">
          <button type="submit" className="button-blue">
            {selectedData?._id ? "Update" : "Create"}
          </button>
          {/* {selectedData?._id && (
                        <button
                            type="button"
                            className='button-blue'
                            onClick={() => {
                                // Duplicate logic
                                const duplicateData = { ...selectedData, _id: undefined };
                                form.setFieldsValue({
                                    ...duplicateData,
                                    name: duplicateData.name,
                                });
                                createEvent(duplicateData);
                            }}
                        >
                            Duplicate
                        </button>
                    )} */}
          <button
            type="button"
            style={{ background: "var(--color-red-500)" }}
            className="button-blue"
            onClick={() => form.resetFields()}
          >
            Cancel
          </button>
        </div>
      </Form>
      <Modal
        onCancel={() => setOpen(false)}
        open={open}
        footer={false}
        centered
        width={800}
      >
        <GetCoordinateMap
          setLoading={setLoading}
          setLocationData={setLocationData}
          close_modal={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default EventAddEditForm;
