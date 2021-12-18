import React, { FC, useEffect, useRef, useState } from "react";
import {
  message,
  Table,
  Upload as UploadComp,
  Spin,
  Tooltip,
  Tag,
  Button,
} from "antd";
import { InboxOutlined, CopyOutlined, LinkOutlined } from "@ant-design/icons";
import axios from "axios";
import { format } from "fecha";
import numerify from "numerify";
import numerifyBytes from "numerify/lib/plugins/bytes.umd.js";
import copy from "copy-to-clipboard";

numerify.register("bytes", numerifyBytes);

const STORE_KEY = "izeral-upload";

const COLUMNS: any = [
  {
    title: "缩略图",
    dataIndex: "pic",
    width: 70,
    key: "pic",
    render: (_, row) => (
      <img
        src={
          /\.(png|jpg|gif|bmp|svg)$/i.test(row.url)
            ? row.url
            : "https://cdn.jsdelivr.net/npm/picture-bed-xigua@2021.12.18-185635-4/file.png"
        }
        style={{
          maxWidth: "28px",
          maxHeight: "28px",
          margin: "0 auto",
        }}
      />
    ),
  },
  {
    title: "文件名",
    dataIndex: "name",
    width: 100,
    key: "name",
    render: (name) => (
      <Tooltip title={name}>
        <span className="one-line name" style={{ width: "100px" }}>
          {name}
        </span>
      </Tooltip>
    ),
  },
  {
    title: "地址",
    dataIndex: "url",
    key: "url",
    width: 130,
    render: (url) => (
      <Tooltip title={url}>
        <span className="one-line url" style={{ width: "130px" }}>
          {url}
        </span>
      </Tooltip>
    ),
  },
  {
    title: "大小",
    dataIndex: "size",
    key: "size",
    width: 100,
    align: "center",
    render: (size) => <Tag color="magenta">{numerify(size, "0.0 b")}</Tag>,
  },
  {
    title: "时间",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 200,
    align: "center",
    render: (createdAt) => (
      <span>{format(new Date(createdAt), "YYYY-MM-DD HH:mm:ss")}</span>
    ),
  },
  {
    title: "操作",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 90,
    align: "center",
    render: (_, row) => (
      <div className="operate-box">
        <Tooltip title="新标签页打开">
          <Button
            shape="circle"
            icon={<LinkOutlined />}
            size="small"
            type="ghost"
            onClick={() => {
              window.open(row.url, "_blank");
            }}
          />
        </Tooltip>
        <Tooltip title="复制链接地址">
          <Button
            shape="circle"
            icon={<CopyOutlined />}
            size="small"
            type="ghost"
            onClick={() => {
              copy(row.url);
              message.success("复制成功");
            }}
          />
        </Tooltip>
      </div>
    ),
  },
];

import "./style.css";

const { Dragger } = UploadComp;

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
        url: "https://upload.xiguaxigua.com/upload",
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
      <Table className="data-table" dataSource={listData} columns={COLUMNS} />;
    </div>
  );
};
