import React, { FC, useEffect, useRef, useState } from "react";
import { message, Table, Upload as UC, Spin, Button } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import { STORE_KEY, COLUMNS } from "./data";

const { Dragger } = UC;
const UPLOAD_DOMAIN = "https://upload.xiguaxigua.com";

export const Upload: FC<any> = () => {
  const timer = useRef(null);
  const files = useRef([]);
  const [loading, setLoading] = useState(false);
  const [listData, setListData] = useState(() => {
    const result = window.localStorage.getItem(STORE_KEY);
    if (!result) return [];
    try {
      return JSON.parse(result);
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  const clearHistory = () => {
    setListData([]);
    message.success("上传历史清除成功");
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(listData));
    } catch (e) {
      console.error(e);
    }
  }, [listData]);

  const storeFiles = (file) => {
    if (timer.current) clearTimeout(timer.current);
    files.current.push(file);
    timer.current = setTimeout(() => {
      triggetUpload();
      clearTimeout(timer.current);
    }, 300);
  };

  const triggetUpload = async () => {
    const formData = new FormData();
    console.log(files.current);
    files.current.forEach((file) => {
      formData.append(
        `file${Date.now()}${(Math.random() * 1e3).toFixed(0)}`,
        file
      );
    });
    try {
      setLoading(true);
      const res = await axios({
        method: "post",
        url: `${UPLOAD_DOMAIN}/upload`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          "Page-Url": window.location.href,
        },
      });
      console.log(res);
      const fileMap = res.data.reduce((acc, curr) => {
        acc[curr.split("/").slice(-1)[0]] = curr;
        return acc;
      }, {});
      console.log("fileMap", fileMap);
      setListData((d) =>
        files.current
          .map((file) => ({
            id: `${Date.now}${(Math.random()*1e5).toFixed(0)}`,
            name: file.name,
            size: file.size,
            createdAt: Date.now(),
            url: fileMap[file.name],
          }))
          .concat(d)
      );
    } catch (e) {
      console.error(e);
      message.error("资源上传失败");
    }
    setLoading(false);
    files.current = [];
  };

  return (
    <div className="page-upload">
      <Spin spinning={loading}>
        <Dragger
          name="file"
          multiple={true}
          showUploadList={false}
          beforeUpload={(file) => {
            storeFiles(file);
            return false;
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽上传文件</p>
        </Dragger>
      </Spin>
      <div className="table-title">
        <span style={{ fontSize: "18px" }}>上传历史</span>
        <Button onClick={() => clearHistory()}>清空上传历史</Button>
      </div>
      <Table
        bordered={true}
        rowKey="id"
        className="data-table"
        dataSource={listData}
        columns={COLUMNS}
      />
    </div>
  );
};
