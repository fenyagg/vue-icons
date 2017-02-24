;{
    "use strict";
    let styleData = {};

    let iconGroupComponent = {
        props: ['groupName', 'searchText'],
        data: function () {
            return {
                emptyIcons: [],
            }
        },
        template: `
                        <div v-if="filterIcons.length" class="c-prop-icon--icon-group">
                            <div class="c-prop-icon--title">{{ groupName }}</div>
                            <div class="c-prop-icon--list">
                                <div
                                    v-for="(icon, index) in filterIcons"
                                    :index="index"
                                    :key="groupName.toLowerCase() + '_'+index"
                                    class="c-prop-icon--item"
                                    @click.prevent="selectIcon(icon)"
                                    :title = "icon"
                                    >
                                     <i :data-icon="icon" :class="getClass(icon, groupName)"></i>
                                </div>
                            </div>
                        </div>`,
        computed: {
            filterIcons: function () {
                return styleData[this.groupName]['ICONS'].filter( icon => {
                    return !this.emptyIcons.includes(icon) && icon.indexOf(this.searchText) + 1;
                });
            },
        },
        methods: {
            getClass: function(icon){
                return [
                    styleData[this.groupName]["ICON_BASE_CLASS"],
                    icon
                ];
            },
            selectIcon: function(icon){
                this.$parent.selectedGroupName = this.groupName;
                this.$parent.selectedIcon = icon;
                this.$parent.modalOpen = false;
            }
        },
        mounted: function () {
            //нужно найти пустые иконки и удалить их
            document.querySelector(".c-prop-icon--search-input").focus();
            this.$el.querySelectorAll("i").forEach( item => {
                if(!item.offsetHeight) this.emptyIcons.push(item.getAttribute("data-icon"));
            });
        }
    };


    Vue.component('c-prop-icon', {
        components: {
            "icon-group": iconGroupComponent,
        },
        props: ['iconSourse'],
        template: `
                <div class="c-prop-icon"">
                    <div class="c-prop-icon--chosen-icon" v-html="btnText" v-if="selectedIcon">{{btnText}}</div>
                    <button class="c-prop-icon--button" type="button" @click.prevent="openModal()">Выбрать иконку</button>
                    
                    <transition name="modal">
                        <div class="c-prop-icon--popup" v-if="modalOpen">
                                <div class="c-prop-icon--popup-overlay" @click.prevent="modalOpen = false"></div>
                                <div class="c-prop-icon--popup-content">
                                    <div class="preloader" v-if="isLoading">Загрузка шрифтов...</div>
                
                                    <input class="c-prop-icon--search-input" type="text" v-model="searchText" v-if="!isLoading" autofocus>
                                    <template v-for="(groupName, index) in styleData">
                                        <icon-group :search-text="searchText" :group-name="index" ></icon-group>
                                    </template>
                                </div>
                        </div>
                    </transition>
                </div>`,
        data: function(){
            return {
                selectedIcon: "",
                selectedGroupName: "",
                modalOpen   : false,
                styleData   : styleData,
                searchText  : "",
                isLoading   : 0,
                errors      : []
            }
        },
        computed:{
            btnText : function () {
                let baseClass = this.selectedGroupName ? styleData[this.selectedGroupName]["ICON_BASE_CLASS"] : "";
                let html = `<i class="${baseClass} ${this.selectedIcon}"> &lt;i class="${baseClass} ${this.selectedIcon}"&gt;&lt;/i&gt;</i>`;
                return this.selectedIcon && this.selectedGroupName ? html : "";
            }
        },
        methods: {
            openModal: function () {
                this.modalOpen = true;
            },
        },
        created: function () {
            for ( let iconData of this.iconSourse) {
                let iconName = iconData.NAME;
                if(!styleData[iconName]) {
                    this.isLoading++;
                    this.$http.get(iconData.SRC).then(response => {
                        let icons = response.body.match(new RegExp(`(${iconData.PREFIX}[a-zA_Z_1-9-]+)`, 'ig'));
                        if(!icons.length) this.errors.push( `В файле {iconData.SRC} иконки не найдены.`);
                        styleData[iconName] = iconData;
                        styleData[iconName]["ICONS"] = icons;
                        this.isLoading--;
                    }, response => {
                        this.isLoading--;
                        this.errors.push( `${iconData.SRC} Ошибка загрузки :(`);
                    });
                }
            }
        },
    });
};