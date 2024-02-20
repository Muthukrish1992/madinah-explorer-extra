import * as React from "react";
import {
  registerWidget,
  registerLink,
  registerUI,
  IContextProvider,
} from "./uxp";
import {
  TitleBar,
  FilterPanel,
  WidgetWrapper,
  SearchBox,
  DataList,
  useDebounce,
  Button,
  Modal,
  Input,
  useToast,
  IconButton,
  useAlert,
} from "uxp/components";
import "./styles.scss";
import { findDOMNode } from "react-dom";

interface IWidgetProps {
  uxpContext?: IContextProvider;
  instanceId?: string;
}

const Madinah_explorer_extraWidget: React.FunctionComponent<IWidgetProps> = (
  props
) => {
  let [find, setFind] = React.useState<string>("");
  let [list, setList] = React.useState<[]>([]);
  let [showAddTags, setShowAddTags] = React.useState<boolean>(false);
  let [tagName, setTagName] = React.useState<string>("");
  let [tagKey, setTagKey] = React.useState<string>("");
  let SearchQuery = useDebounce(find);
  let toast = useToast();
  let alerts = useAlert();

  function DeleteTags(poi: any, tag: any) {
    console.log("inside handle delete", tagKey, tagName);
    alerts.confirm("Are you sure?").then((hasConfirmed: any) => {
      if (hasConfirmed) {
        props.uxpContext
          .executeAction(
            "MadinahExplorer",
            "DeleteTagForPOI",
            { poi: poi, tag: tag },
            { json: true }
          )
          .then((res: any) => {
            toast.success("Tag Deleted");
            functionSearch();
          })
          .catch((e) => {
            toast.error("deletion failed");
          });
      }
    });
  }

  function updateTags() {
    props.uxpContext
      .executeAction(
        "MadinahExplorer",
        "AddTagForPOI",
        { poi: tagKey, tag: tagName },
        { json: true }
      )
      .then((res: any) => {
        toast.success("Tag added Successfully");
        functionSearch();
        setShowAddTags(false);
      })
      .catch((e) => {
        toast.error("Tag addition failed");
      });
  }
  function renderItem(item: any, key: number) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <div style={{ marginRight: "10px" }}>
          <img
            src={item.ImageUrl}
            alt="Item Image"
            style={{ width: "100px", height: "100px" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: "10px" }}>
            <strong>Name:</strong> {item.Name}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>Description:</strong> {item.Description}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: "10px" }}>
            <Button
              className="addTags"
              title="Add Tags"
              onClick={() => {
                setTagKey(item.Key);
                setShowAddTags(true);
              }}
            />
          </div>
          <div
            style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
          >
            {item.tags.map((tag: any, index: any) => (
              <div
                key={index}
                style={{
                  marginRight: "5px",
                  marginBottom: "5px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    marginRight: "5px",
                    padding: "5px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "5px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {tag}
                  <IconButton
                    type="delete"
                    onClick={() => {
                      DeleteTags(item.Key, item.tags[index]);
                    }}
                    className="custom-css-class"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  function functionSearch() {
    props.uxpContext
      .executeAction(
        "MadinahExplorer",
        "SearchAllPOIsWithTags",
        { q: SearchQuery },
        { json: true }
      )
      .then((x) => {
        console.log(x);
        setList(x);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  console.log("list", list);
  return (
    <WidgetWrapper>
      <TitleBar title="Madinah_explorer_extra">
        <SearchBox
          placeholder="Search"
          value={find}
          onChange={(text: any) => {
            setFind(text);
            functionSearch();
          }}
        ></SearchBox>
      </TitleBar>
      <DataList
        data={list}
        renderItem={(item, key) => renderItem(item, key)}
        pageSize={10}
      />
      <Modal
        show={showAddTags}
        onClose={() => setShowAddTags(false)}
        title={"Add Tags"}
      >
        <label className="label">
          * Add Tag:
          <Input
            className="name"
            value={tagName}
            onChange={(value) => {
              setTagName(value);
            }}
          />
        </label>
        <Button
          title="Update Tags"
          onClick={updateTags}
          loadingTitle="Loading..."
          className="custom-css-class"
        />
      </Modal>
    </WidgetWrapper>
  );
};

/**
 * Register as a Widget
 */
registerWidget({
  id: "madinah_explorer_extra",
  widget: Madinah_explorer_extraWidget,
  configs: {
    layout: {
      // w: 12,
      // h: 12,
      // minH: 12,
      // minW: 12
    },
  },
});

/**
 * Register as a Sidebar Link
 */
/*
registerLink({
    id: "madinah_explorer_extra",
    label: "Madinah_explorer_extra",
    // click: () => alert("Hello"),
    component: Madinah_explorer_extraWidget
});
*/

/**
 * Register as a UI
 */

/*
registerUI({
    id:"madinah_explorer_extra",
    component: Madinah_explorer_extraWidget
});
*/
