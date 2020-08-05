FilePond.registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageResize,
  FilePondPluginFileEncode
); // registering the plugin

//setoption
FilePond.setOptions({
  stylePanelAspectRatio: 150 / 100,
  imageResizeTargetWidth: 100,
  imageResizeTargetHeight: 150,
});

FilePond.parse(document.body);
