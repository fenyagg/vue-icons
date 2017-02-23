;{
    "use strict";
    let iconGroupComponent = {
        props: ['iconGroup', 'searchText'],
        data: function () {
            return {
                emptyIcons: []
            }
        },
        template: `
                        <div v-if="filterIcons.length" class="c-prop-icon--icon-group">
                            <div class="c-prop-icon--title">{{ iconGroup.NAME }}</div>
                            <div class="c-prop-icon--list">
                                <div
                                    v-for="(icon, index) in filterIcons"
                                    :index="index"
                                    :key="iconGroup.NAME.toLowerCase() + '_'+index"
                                    class="c-prop-icon--item"
                                    >
                                     <i :data-icon="icon" :class="[iconGroup.ICON_BASE_CLASS, icon]"></i>
                                </div>
                            </div>
                        </div>`,
        computed: {
            filterIcons: function () {
                return this.iconGroup.ICON_LIST.filter( icon => {
                    return !this.emptyIcons.includes(icon) && icon.indexOf(this.searchText) + 1;
                });
            }
        },
        mounted: function () {
            //нужно чтобы найти пустые иконки и удалить их
            this.$el.querySelectorAll("i").forEach( item => {
                if(!item.offsetHeight) this.emptyIcons.push(item.getAttribute("data-icon"));
            });
        }
    };

    window.app = new Vue({
        el: '#c-prop-icon',
        components: {
            "icon-group": iconGroupComponent
        },
        template: `
                <div class="c-prop-icon__popup">
                    <div class="preloader" v-if="statusText">{{statusText}}</div>

                    <input type="text" v-model="searchText" v-if="!statusText">
                    <template v-for="icongroup in icons">
                        <icon-group :search-text="searchText" :icon-group="icongroup" ></icon-group>
                    </template>

                </div>`,
        data: {
            icons       : [],
            searchText  : "",
            statusText  : "Загрузка шрифтов..."
        },
        created: function () {
            this.$http.get('response.html').then(response => {
                this.statusText = "";
                this.icons = response.body;
            }, response => {
                this.statusText = "Ошибка загрузки :(";
            });
        },
    });

};