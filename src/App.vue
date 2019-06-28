<template>
  <div
    id="app"
    class="app-viewport"
  >
    <!-- top bar -->
    <md-toolbar>
      <!-- back button -->
      <md-button
        class="md-icon-button"
        v-if="mode != 'showlist'"
        @click="onBack"
      >
        <md-icon>arrow_back</md-icon>
      </md-button>
      <!-- page title -->
      <h2
        class="md-title"
        style="flex: 1"
      >{{ pageTitle }}</h2>
      <!-- save new shopping list button -->
      <md-button
        class="md-icon-button"
        v-if="mode === 'addlist'"
        @click="onClickSaveShoppingList"
        :disabled="singleList.title.length == 0"
      >
        <md-icon>check</md-icon>
      </md-button>
    </md-toolbar>

    <!-- list of shopping list -->
    <md-list v-if="mode === 'showlist'">
      <md-card
        v-for="list in shoppingLists"
        :key="list._id"
        :data_id="list._id"
      >
        <md-card-header>
          <div class="md-title">{{ list.title }}</div>
          <div class="md-subhead">{{ list.place.title }}</div>
        </md-card-header>

        <md-card-content v-if="counts[list.id]">
          {{ counts[list._id].checked }} / {{ counts[list._id].total }}
        </md-card-content>

        <md-card-actions>
          <md-button @click="onClickList(list._id, list.title)">
            <md-icon>chevron_right</md-icon>
          </md-button>
        </md-card-actions>
      </md-card>
    </md-list>

    <!-- add new shopping list form -->
    <md-card v-if="mode === 'addlist'">
      <md-card-header>Add Shopping List</md-card-header>
      <md-card-content>
        <md-field>
          <label>List name</label>
          <md-input
            placeholder="e.g. Food"
            v-model="singleList.title"
          ></md-input>
        </md-field>

        <md-field>
          <label>Place name</label>
          <md-input
            placeholder="e.g. Whole Foods, Reno"
            v-model="singleList.place.title"
          ></md-input>
        </md-field>
      </md-card-content>
    </md-card>

    <!-- shopping list item editor -->
    <md-list
      class="itemedit"
      v-if="mode === 'itemedit'"
    >
      <md-list-item>
        <md-field>
          <md-input
            v-model="newItemTitle"
            placeholder="New item e.g. eggs"
            @keyup.enter.native="onAddListItem"
          ></md-input>
        </md-field>
        <md-button
          class="md-icon-button md-list-action"
          @click="onAddListItem"
          :disabled="newItemTitle.length == 0"
        >
          <md-icon class="md-pimary">add</md-icon>
        </md-button>
      </md-list-item>
      <md-list-item
        v-for="item in shoppingListItems"
        :key="item._id"
      >
        <!-- v-if="item.list == currentListId" -->
        <div>
          <md-checkbox
            v-model="item.checked"
            class="md-primary"
          ></md-checkbox>
        </div>
        <div class="md-list-text-container">
          <span :class="{ cardchecked: item.checked}">
            {{ item.title }}
          </span>
        </div>
      </md-list-item>
    </md-list>

    <!-- floating 'add shopping list' button -->
    <div
      class="floatingButton"
      v-if="mode === 'showlist'"
    >
      <md-button
        class="md-fab md-primary md-raised"
        @click="onClickAddShoppingList"
      >
        <md-icon>add</md-icon>
      </md-button>
    </div>
  </div>
</template>

<script>
import { format } from "path";
import PouchDb from "pouchdb-browser";

let db = new PouchDB("shopping");

const sampleShoppingList = {
  _id: "",
  type: "list",
  version: 1,
  title: "",
  checked: false,
  place: {
    title: "",
    license: null,
    lat: null,
    lon: null,
    address: {}
  },
  createdAt: "",
  updatedAt: ""
};

const sampleListItem = {
  _id: "list:cj6mj1zfj000001n1ugjfkj33:item:cj6mn7e36000001p9n14fgk6s",
  type: "item",
  version: 1,
  title: "",
  checked: false,
  createdAt: "",
  updatedAt: ""
};

export default {
  name: "app",
  data() {
    return {
      pageTitle: "Shopping List",
      shoppingLists: [],
      shoppingListItems: [],
      mode: "showlist",
      singleList: null,
      currentListId: null,
      newItemTitle: ""
    };
  },
  computed: {
    counts() {
      let obj = {};
      for (let i in this.shoppingListItems) {
        let d = this.shoppingListItems[i];
        if (!obj[d.list]) {
          obj[d.list] = { total: 0, checked: 0 };
        }
        obj[d.list].total++;
        if (d.checked) {
          obj[d.list].checked++;
        }
      }
      return obj;
    }
  },
  methods: {
    onBack() {
      this.mode = "showlist";
      this.pageTitle = "Shopping Lists";
    },
    onClickSaveShoppingList() {
      // add timestamps
      this.singleList.updatedAt = new Date().toISOString();

      // add to on-screen list
      this.shoppingLists.unshift(this.singleList);

      //write to database
      db.put(this.singleList).then(data => {
        // keep the revision tokens
        this.singleList._rev = data.rev;

        // switch mode
        this.onBack();
      });
    },
    onClickList(id, title) {
      this.currentListId = id;
      this.pageTitle = title;
      this.mode = "itemedit";
    },
    onClickAddShoppingList() {
      // open shopping list form
      this.pageTitle = "New Shopping List";
      this.mode = "addlist";
      this.singleList = JSON.parse(JSON.stringify(sampleShoppingList));
      this.singleList._id = "list:" + cuid();
      this.singleList.createdAt = new Date().toISOString();
    },
    onAddListItem() {
      if (!this.newItemTitle) return;
      let obj = JSON.parse(JSON.stringify(sampleListItem));
      obj._id = "item:" + cuid();
      obj.title = this.newItemTitle;
      obj.list = this.currentListId;
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
      this.shoppingListItems.unshift(obj);
      this.newItemTitle = "";
    }
  }
};
</script>

<style>
body {
  background-color: #9e9e9e;
}
.main-toolbar {
  position: sticky;
  top: 0px;
  z-index: 1000;
}
.md-theme-default.md-card {
  background-color: white !important;
  margin: 20px;
}
.floatingButton {
  position: fixed;
  bottom: 5px;
  right: 5px;
  z-index: 1000;
}
.itemedit {
  background-color: white !important;
}
.cardchecked {
  text-decoration: line-through;
  color: #cccccc;
}
</style>
